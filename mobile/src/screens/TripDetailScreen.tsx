import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { openDB } from '../database';
import { useThemeStore } from '../store/themeStore';

export const TripDetailScreen = ({ navigation, route }: any) => {
  const { tripId } = route.params;
  const isDarkMode = useThemeStore(s => s.isDarkMode);
  
  const [trip, setTrip] = useState<any>(null);
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [endLat, setEndLat] = useState('');
  const [endLng, setEndLng] = useState('');

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const db = await openDB();
      const loaded = await db.getFirstAsync<any>('SELECT * FROM trips WHERE id = ?', tripId);
      if (loaded) {
        setTrip(loaded);
        setStartPoint(loaded.start_point || '');
        setDestination(loaded.destination || '');
        setGpsLat(loaded.start_lat?.toString() || '');
        setGpsLng(loaded.start_lng?.toString() || '');
        setEndLat(loaded.end_lat?.toString() || '');
        setEndLng(loaded.end_lng?.toString() || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMeta = async () => {
    try {
      const db = await openDB();
      await db.runAsync('UPDATE trips SET start_point = ?, destination = ?, is_synced = 0 WHERE id = ?', startPoint, destination, tripId);
      Alert.alert('Saved', 'Trip details updated.');
      loadTrip();
    } catch (e) {
      Alert.alert('Error', 'Failed to update trip.');
    }
  };

  const handleUpdateGPS = async () => {
    const sLat = parseFloat(gpsLat);
    const sLng = parseFloat(gpsLng);
    const eLat = parseFloat(endLat);
    const eLng = parseFloat(endLng);
    
    try {
      const db = await openDB();
      await db.runAsync(
        'UPDATE trips SET start_lat = ?, start_lng = ?, end_lat = ?, end_lng = ?, is_synced = 0 WHERE id = ?', 
        isNaN(sLat) ? null : sLat,
        isNaN(sLng) ? null : sLng,
        isNaN(eLat) ? null : eLat,
        isNaN(eLng) ? null : eLng,
        tripId
      );
      Alert.alert('Success', 'GPS Coordinate overwritten.');
      setShowGPSModal(false);
      loadTrip();
    } catch (e) {
      Alert.alert('Error', 'Failed to update GPS.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Confirm', 'Are you sure you want to delete this trace completely?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const db = await openDB();
          await db.execAsync(`DELETE FROM trips WHERE id = '${tripId}'`);
          navigation.goBack();
      }}
    ]);
  };

  if (!trip) return null;

  const ts = {
    bg: { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' },
    cardBg: { backgroundColor: isDarkMode ? '#374151' : 'white' },
    text: { color: isDarkMode ? '#F9FAFB' : '#1F2937' },
    sub: { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
    input: { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#4B5563' : '#E5E7EB', color: isDarkMode ? 'white' : 'black' },
  };

  return (
    <ScrollView style={[styles.container, ts.bg]}>
      <Text style={[styles.title, ts.text]}>Trip Details</Text>
      
      <View style={[styles.card, ts.cardBg]}>
        <Text style={[styles.label, ts.sub]}>Start Point</Text>
        <TextInput 
          style={[styles.input, ts.input]} 
          value={startPoint} 
          onChangeText={setStartPoint} 
          placeholder="Where from?" 
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#D1D5DB'}
        />

        <Text style={[styles.label, ts.sub, { marginTop: 12 }]}>Destination</Text>
        <TextInput 
          style={[styles.input, ts.input]} 
          value={destination} 
          onChangeText={setDestination} 
          placeholder="Where to?" 
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#D1D5DB'}
        />
        
        <TouchableOpacity style={[styles.updateBtn, { marginBottom: 12 }]} onPress={handleUpdateMeta}>
          <Text style={styles.btnText}>Save Basic Layout</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, ts.cardBg, { marginTop: 16 }]}>
        <Text style={[styles.title, ts.text, { fontSize: 18 }]}>Advanced GPS Overwrite</Text>
        <Text style={[styles.label, ts.sub, { marginBottom: 16 }]}>
          Ended: {trip?.end_time ? new Date(trip.end_time).toLocaleString() : 'Ongoing'}
        </Text>

        <Text style={[styles.label, ts.sub]}>Start Latitude</Text>
        <TextInput style={[styles.input, ts.input]} value={gpsLat} onChangeText={setGpsLat} keyboardType="numeric" />
        <Text style={[styles.label, ts.sub, { marginTop: 6 }]}>Start Longitude</Text>
        <TextInput style={[styles.input, ts.input]} value={gpsLng} onChangeText={setGpsLng} keyboardType="numeric" />
        
        <Text style={[styles.label, ts.sub, { marginTop: 12 }]}>End Latitude</Text>
        <TextInput style={[styles.input, ts.input]} value={endLat} onChangeText={setEndLat} keyboardType="numeric" />
        <Text style={[styles.label, ts.sub, { marginTop: 6 }]}>End Longitude</Text>
        <TextInput style={[styles.input, ts.input]} value={endLng} onChangeText={setEndLng} keyboardType="numeric" />
        
        <TouchableOpacity style={[styles.updateBtn, { backgroundColor: '#F59E0B', marginTop: 16 }]} onPress={handleUpdateGPS}>
          <Text style={styles.btnText}>Force GPS Layout Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, ts.cardBg, { marginTop: 16, marginBottom: 40 }]}>
        <Text style={[styles.title, ts.text, { fontSize: 18 }]}>Danger Zone</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.btnText}>Delete Trip Entirely</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  card: { padding: 20, borderRadius: 16, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1 },
  updateBtn: { backgroundColor: '#3B82F6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  gpsBtn: { backgroundColor: '#F59E0B', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  deleteBtn: { backgroundColor: '#EF4444', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { padding: 20, borderRadius: 16 }
});
