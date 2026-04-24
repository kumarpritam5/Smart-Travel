import { useState, useEffect, useCallback } from 'react';
import { openDB } from '../database';

export interface Trip {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string | null;
  distance?: number | null;
  duration?: number | null;
  start_point?: string | null;
  destination?: string | null;
  description?: string | null;
  total_expense: number;
  is_synced: number;
}

export const useTrips = (userId: string | undefined) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const loadTrips = useCallback(async () => {
    if (!userId) return;
    try {
      const db = await openDB();
      const allTrips = await db.getAllAsync<Trip>('SELECT * FROM trips WHERE user_id = ? ORDER BY start_time DESC', userId);
      setTrips(allTrips);
      const total = allTrips.reduce((acc, trip) => acc + (trip.total_expense || 0), 0);
      setTotalExpense(total);
    } catch (e) {
      console.error('Error loading trips', e);
    }
  }, [userId]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const addTrip = async (trip: Trip) => {
    try {
      const db = await openDB();
      await db.runAsync(
        `INSERT INTO trips (id, user_id, start_time, start_point, destination, total_expense, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        trip.id, trip.user_id, trip.start_time, trip.start_point || null, trip.destination || null, trip.total_expense, 0
      );
      loadTrips();
    } catch (e) {
      console.error('Error adding trip', e);
    }
  };

  return { trips, totalExpense, loadTrips, addTrip };
};
