import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, Modal, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { syncData } from '../services/syncService';
import { useThemeStore } from '../store/themeStore';
import { useFocusEffect } from '@react-navigation/native';

export const DashboardScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const { trips, totalExpense, addTrip, loadTrips } = useTrips(user?.id);
  const [syncing, setSyncing] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeStore();

  const [showSetup, setShowSetup] = useState(false);
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');

  // Refresh trips every time Dashboard comes into focus (after ending/deleting a trip)
  useFocusEffect(useCallback(() => { loadTrips(); }, [loadTrips]));
  const confirmStartTrip = async () => {
    const newTrip = {
      id: Math.random().toString(36).substring(7),
      user_id: user!.id,
      start_time: new Date().toISOString(),
      start_point: startPoint,
      destination: destination,
      total_expense: 0,
      is_synced: 0
    };
    await addTrip(newTrip);
    setShowSetup(false);
    setStartPoint('');
    setDestination('');
    navigation.navigate('ActiveTrip', { tripId: newTrip.id });
  };

  const handleSync = async () => {
    if (!user?.token) return;
    setSyncing(true);
    const success = await syncData(user.token);
    setSyncing(false);
    if (success) {
      alert('Sync successful');
    } else {
      alert('Sync failed. Please check backend connection.');
    }
  };

  const renderTripItem = ({ item }: { item: any }) => {
    const d = new Date(item.start_time);
    return (
      <TouchableOpacity onPress={() => navigation.navigate('TripDetail', { tripId: item.id })} style={[styles.tripItem, { backgroundColor: isDarkMode ? '#374151' : 'white' }]}>
        <View>
          <Text style={[styles.tripDate, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{d.toLocaleDateString()} {d.toLocaleTimeString()}</Text>
          <Text style={[styles.tripSub, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            {item.start_point ? `${item.start_point} to ` : ''}{item.destination ? item.destination : 'Ongoing'}
          </Text>
        </View>
        <Text style={styles.tripExpense}>₹{item.total_expense?.toFixed(2) || '0.00'}</Text>
      </TouchableOpacity>
    );
  };

  const ts = {
    bg: { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' },
    headerBg: { backgroundColor: isDarkMode ? '#1F2937' : 'white' },
    text: { color: isDarkMode ? '#F9FAFB' : '#1F2937' },
    cardBg: { backgroundColor: isDarkMode ? '#1F2937' : 'white' },
    subText: { color: isDarkMode ? '#9CA3AF' : '#374151' },
    statTitle: { color: isDarkMode ? '#D1D5DB' : '#6B7280' },
    modalBg: { backgroundColor: isDarkMode ? '#1F2937' : 'white' },
    input: { backgroundColor: isDarkMode ? '#374151' : 'white', borderColor: isDarkMode ? '#4B5563' : '#D1D5DB', color: isDarkMode ? 'white' : 'black' }
  };

  return (
    <View style={[styles.container, ts.bg]}>
      <View style={[styles.header, ts.headerBg]}>
        <View>
          <Text style={[styles.welcome, ts.text]}>Hi, {user?.name}</Text>
          <View style={styles.themeToggleRow}>
            <Text style={[styles.themeLabel, ts.subText]}>{isDarkMode ? 'Dark' : 'Light'} Mode</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} style={{ transform: [{ scale: 0.8 }] }} />
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
            <Text style={styles.syncButtonText}>{syncing ? 'Syncing...' : 'Sync'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.statsCard, ts.cardBg]}>
        <Text style={[styles.statsTitle, ts.text]}>Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, ts.statTitle]}>Trips</Text>
            <Text style={styles.statValue}>{trips.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statLabel, ts.statTitle]}>Total Expenses</Text>
            <Text style={styles.statValue}>₹{totalExpense.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, ts.text]}>Recent Trips</Text>
      </View>

      <FlatList 
        data={trips}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTripItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No trips recorded yet.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowSetup(true)}>
        <Text style={styles.fabText}>Start Trip</Text>
      </TouchableOpacity>

      <Modal visible={showSetup} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, ts.modalBg]}>
            <Text style={[styles.modalTitle, ts.text]}>Pre-Trip Setup</Text>
            
            <Text style={[styles.label, ts.subText]}>Starting Point (Optional)</Text>
            <TextInput style={[styles.input, ts.input]} value={startPoint} onChangeText={setStartPoint} placeholder="Where are you starting?" placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'} />
            
            <Text style={[styles.label, ts.subText, { marginTop: 12 }]}>Destination (Optional)</Text>
            <TextInput style={[styles.input, ts.input]} value={destination} onChangeText={setDestination} placeholder="Where to?" placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#6B7280' }]} onPress={() => setShowSetup(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#10B981' }]} onPress={confirmStartTrip}>
                <Text style={styles.btnText}>Start Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, elevation: 2 },
  themeToggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  themeLabel: { fontSize: 12, marginRight: 6 },
  headerActions: { flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  welcome: { fontSize: 22, fontWeight: '700' },
  syncButton: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  syncButtonText: { color: 'white', fontWeight: '600', fontSize: 12 },
  profileButton: { backgroundColor: '#8B5CF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  profileButtonText: { color: 'white', fontWeight: '600', fontSize: 12 },
  logoutButton: { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statsCard: { margin: 20, padding: 20, borderRadius: 16, elevation: 3 },
  statsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flex: 1 },
  statLabel: { fontSize: 14, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#10B981' },
  listHeader: { paddingHorizontal: 20, marginBottom: 12 },
  listTitle: { fontSize: 18, fontWeight: '600' },
  tripItem: { marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  tripDate: { fontSize: 16, fontWeight: '600' },
  tripSub: { fontSize: 14, marginTop: 4 },
  tripExpense: { fontSize: 18, fontWeight: '700', color: '#EF4444' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20 },
  fab: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#3B82F6', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, elevation: 5 },
  fabText: { color: 'white', fontSize: 18, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 20, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  btnText: { color: 'white', fontWeight: 'bold' }
});
