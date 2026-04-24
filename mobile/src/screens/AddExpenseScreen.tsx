import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { openDB } from '../database';
import { useThemeStore } from '../store/themeStore';

const CATEGORIES = ['Food', 'Transport', 'Hotel', 'Other'];

export const AddExpenseScreen = ({ navigation, route }: any) => {
  const tripId = route.params?.tripId;
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Silently fetch coordinates
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude.toString());
      setLongitude(loc.coords.longitude.toString());
    })();
  }, []);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    const numAmount = parseFloat(amount);
    const latNum = latitude ? parseFloat(latitude) : null;
    const lngNum = longitude ? parseFloat(longitude) : null;

    try {
      const db = await openDB();
      const id = Math.random().toString(36).substring(7);
      const timestamp = new Date().toISOString();
      
      await db.runAsync(
        'INSERT INTO expenses (id, trip_id, amount, category, note, payment_method, latitude, longitude, timestamp, is_auto, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)',
        id, tripId, numAmount, category, note, paymentMethod, latNum, lngNum, timestamp
      );

      await db.runAsync(
        'UPDATE trips SET total_expense = total_expense + ? WHERE id = ?',
        numAmount, tripId
      );

      Alert.alert('Success', 'Expense added successfully');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const ts = {
    bg: { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' },
    text: { color: isDarkMode ? '#F9FAFB' : '#1F2937' },
    label: { color: isDarkMode ? '#9CA3AF' : '#4B5563' },
    input: { backgroundColor: isDarkMode ? '#374151' : 'white', borderColor: isDarkMode ? '#4B5563' : '#D1D5DB', color: isDarkMode ? 'white' : 'black' },
    catBg: { backgroundColor: isDarkMode ? '#4B5563' : '#E5E7EB' },
    catText: { color: isDarkMode ? '#D1D5DB' : '#4B5563' }
  };

  return (
    <ScrollView style={[styles.container, ts.bg]}>
      <Text style={[styles.title, ts.text]}>Add Expense</Text>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, ts.label]}>Amount (₹)</Text>
        <TextInput 
          style={[styles.input, ts.input]} 
          keyboardType="numeric" 
          value={amount} 
          onChangeText={setAmount} 
          placeholder="0.00" 
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, ts.label]}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryBtn, ts.catBg, category === cat && styles.categoryBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, ts.catText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, ts.label]}>Payment Method</Text>
        <View style={styles.categoryRow}>
          {['Cash', 'UPI', 'Card'].map(method => (
            <TouchableOpacity 
              key={method} 
              style={[styles.categoryBtn, ts.catBg, paymentMethod === method && styles.categoryBtnActive]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={[styles.categoryText, ts.catText, paymentMethod === method && styles.categoryTextActive]}>{method}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, ts.label]}>Note (Optional)</Text>
        <TextInput 
          style={[styles.input, ts.input]} 
          value={note} 
          onChangeText={setNote} 
          placeholder="What was this for?" 
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, ts.label]}>Latitude</Text>
            <TextInput style={[styles.input, ts.input]} value={latitude} onChangeText={setLatitude} keyboardType="numeric" placeholder="Lat" placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'} />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, ts.label]}>Longitude</Text>
            <TextInput style={[styles.input, ts.input]} value={longitude} onChangeText={setLongitude} keyboardType="numeric" placeholder="Lng" placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'} />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  categoryBtnActive: { backgroundColor: '#3B82F6' },
  categoryText: { fontWeight: '500' },
  categoryTextActive: { color: 'white' },
  saveButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
