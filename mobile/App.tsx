import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { initDB } from './src/database';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ActiveTripScreen } from './src/screens/ActiveTripScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TripDetailScreen } from './src/screens/TripDetailScreen';

const Stack = createNativeStackNavigator();

const Router = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
            <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const [dbOk, setDbOk] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDB();
        setDbOk(true);
      } catch (e) {
        console.error('DB Init Error', e);
      }
    };
    setup();
  }, []);

  if (!dbOk) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Initializing Database...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
