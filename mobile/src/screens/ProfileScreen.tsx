import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useThemeStore } from '../store/themeStore';
import { openDB } from '../database';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, signIn } = useAuth();
  const isDarkMode = useThemeStore(s => s.isDarkMode);
  const [name, setName] = useState(user?.name || '');

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    try {
      const db = await openDB();
      await db.runAsync('UPDATE users SET name = ? WHERE id = ?', name, user!.id);
      
      // Local context update
      if (user) {
        await signIn({ ...user, name });
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const ts = {
    bg: { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' },
    text: { color: isDarkMode ? '#F9FAFB' : '#1F2937' },
    input: { backgroundColor: isDarkMode ? '#374151' : 'white', borderColor: isDarkMode ? '#4B5563' : '#D1D5DB', color: isDarkMode ? 'white' : 'black' },
    btnBg: { backgroundColor: '#3B82F6' },
  };

  return (
    <View style={[styles.container, ts.bg]}>
      <Text style={[styles.title, ts.text]}>Edit Profile</Text>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: isDarkMode ? '#9CA3AF' : '#4B5563' }]}>Username</Text>
        <TextInput 
          style={[styles.input, ts.input]} 
          value={name} 
          onChangeText={setName} 
          placeholder="Enter your name" 
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
        />
      </View>

      <TouchableOpacity style={[styles.saveButton, ts.btnBg]} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1 },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
