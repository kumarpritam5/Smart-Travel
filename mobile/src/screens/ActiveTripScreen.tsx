import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { openDB } from '../database';
import { useThemeStore } from '../store/themeStore';

export const ActiveTripScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const tripId = route.params?.tripId;
  const isDarkMode = useThemeStore(s => s.isDarkMode);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [routePoints, setRoutePoints] = useState<{latitude: number, longitude: number}[]>([]);
  const [tracking, setTracking] = useState(false);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseTotal, setExpenseTotal] = useState(0);

  const loadExpenses = useCallback(async () => {
    try {
      const db = await openDB();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM expenses WHERE trip_id = ? ORDER BY timestamp DESC',
        tripId
      );
      setExpenses(rows);
      const total = rows.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
      setExpenseTotal(total);
    } catch (e) {
      console.error('Error loading expenses', e);
    }
  }, [tripId]);

  // Reload every time user comes back from AddExpenseScreen
  useFocusEffect(useCallback(() => { loadExpenses(); }, [loadExpenses]));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setStartLat(loc.coords.latitude.toString());
      setStartLng(loc.coords.longitude.toString());
    })();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const saveRoutePoint = async (lat: number, lng: number) => {
    try {
      const db = await openDB();
      const id = Math.random().toString(36).substring(7);
      const timestamp = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO route_points (id, trip_id, latitude, longitude, timestamp, is_synced) VALUES (?, ?, ?, ?, ?, 0)',
        id, tripId, lat, lng, timestamp
      );
    } catch (e) {
      console.error(e);
    }
  };

  const startTracking = async () => {
    const numLat = parseFloat(startLat);
    const numLng = parseFloat(startLng);
    if (!isNaN(numLat) && !isNaN(numLng)) {
      try {
        const db = await openDB();
        await db.runAsync('UPDATE trips SET start_lat=?, start_lng=? WHERE id=?', numLat, numLng, tripId);
        const pt = { latitude: numLat, longitude: numLng };
        setRoutePoints([pt]);
        saveRoutePoint(numLat, numLng);
      } catch (e) {}
    }

    setTracking(true);
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (loc) => {
        setLocation(loc);
        const pt = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setRoutePoints(prev => [...prev, pt]);
        saveRoutePoint(pt.latitude, pt.longitude);
      }
    );
    setSubscription(sub);
  };

  const stopTracking = async () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setTracking(false);
    
    // Update trip with end time
    try {
      const db = await openDB();
      await db.runAsync(
        'UPDATE trips SET end_time = ?, end_lat = ?, end_lng = ? WHERE id = ?',
         new Date().toISOString(), location?.coords.latitude || null, location?.coords.longitude || null, tripId
      );
    } catch (e) {}
    
    Alert.alert('Trip Ended', 'Your trip route has been saved.');
    navigation.goBack();
  };

  const ts = {
    panelBg: { backgroundColor: isDarkMode ? '#1F2937' : 'white' },
    text: { color: isDarkMode ? '#F9FAFB' : '#1F2937' },
    sub: { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
    input: { backgroundColor: isDarkMode ? '#374151' : 'white', borderColor: isDarkMode ? '#4B5563' : '#D1D5DB', color: isDarkMode ? 'white' : 'black' },
    btnText: { color: isDarkMode ? '#1F2937' : '#374151' }
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        showsUserLocation
        followsUserLocation
        initialRegion={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : undefined}
      >
        {routePoints.length > 0 && (
          <Polyline coordinates={routePoints} strokeWidth={4} strokeColor="#3B82F6" />
        )}
      </MapView>

      <View style={[styles.panel, ts.panelBg]}>
        <Text style={[styles.title, ts.text]}>Trip tracking {tracking ? 'Active' : 'Paused'}</Text>
        <Text style={[styles.stats, ts.sub]}>GPS Points: {routePoints.length}</Text>

        {/* Live Expense Panel */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, padding: 10, borderRadius: 10, backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}>
          <View>
            <Text style={[{ fontSize: 12 }, ts.sub]}>Expenses Added</Text>
            <Text style={[{ fontSize: 18, fontWeight: '700', color: '#EF4444' }]}>{expenses.length}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[{ fontSize: 12 }, ts.sub]}>Total Spent</Text>
            <Text style={[{ fontSize: 18, fontWeight: '700', color: '#EF4444' }]}>₹{expenseTotal.toFixed(2)}</Text>
          </View>
        </View>
        
        {!tracking ? (
          <View>
            <TouchableOpacity style={styles.startButton} onPress={startTracking}>
              <Text style={styles.buttonText}>Start GPS Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
            <Text style={styles.buttonText}>Stop Tracking & Finish Trip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.addExpenseButton, { backgroundColor: isDarkMode ? '#4B5563' : '#F3F4F6', borderColor: isDarkMode ? '#374151' : '#D1D5DB' }]} 
          onPress={() => navigation.navigate('AddExpense', { tripId })}
        >
          <Text style={[styles.addExpenseText, ts.text]}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  panel: { position: 'absolute', bottom: 20, left: 20, right: 20, padding: 20, borderRadius: 16, elevation: 5 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  stats: { textAlign: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  formGroup: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { padding: 12, borderRadius: 8, fontSize: 14, borderWidth: 1 },
  startButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center' },
  stopButton: { backgroundColor: '#EF4444', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  addExpenseButton: { marginTop: 12, borderWidth: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  addExpenseText: { fontWeight: '600', fontSize: 16 }
});
