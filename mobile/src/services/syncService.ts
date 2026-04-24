import axios from 'axios';
import { openDB } from '../database';

// Use an env variable or config for real production
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export const syncData = async (token: string) => {
  if (!token) return;

  const db = await openDB();
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // 1. Sync Trips
    const unsyncedTrips = await db.getAllAsync('SELECT * FROM trips WHERE is_synced = 0');
    if (unsyncedTrips.length > 0) {
      await axios.post(`${API_URL}/api/sync/trips`, { trips: unsyncedTrips }, { headers });
      const tripIds = unsyncedTrips.map((t: any) => `'${t.id}'`).join(',');
      await db.runAsync(`UPDATE trips SET is_synced = 1 WHERE id IN (${tripIds})`);
      console.log(`Synced ${unsyncedTrips.length} trips`);
    }

    // 2. Sync Expenses
    const unsyncedExpenses = await db.getAllAsync('SELECT * FROM expenses WHERE is_synced = 0');
    if (unsyncedExpenses.length > 0) {
      await axios.post(`${API_URL}/api/sync/expenses`, { expenses: unsyncedExpenses }, { headers });
      // update is_synced via simple loop since IN clause has limits if too many
      for (const exp of unsyncedExpenses as any[]) {
        await db.runAsync(`UPDATE expenses SET is_synced = 1 WHERE id = ?`, exp.id);
      }
      console.log(`Synced ${unsyncedExpenses.length} expenses`);
    }

    // 3. Sync Route Points
    const unsyncedRoutes = await db.getAllAsync('SELECT * FROM route_points WHERE is_synced = 0');
    if (unsyncedRoutes.length > 0) {
      const CHUNK_SIZE = 500;
      for (let i = 0; i < unsyncedRoutes.length; i += CHUNK_SIZE) {
        const chunk = unsyncedRoutes.slice(i, i + CHUNK_SIZE);
        await axios.post(`${API_URL}/api/sync/routes`, { routePoints: chunk }, { headers });
        for (const pt of chunk as any[]) {
          await db.runAsync(`UPDATE route_points SET is_synced = 1 WHERE id = ?`, pt.id);
        }
      }
      console.log(`Synced ${unsyncedRoutes.length} route points`);
    }
    
    return true;

  } catch (error) {
    console.error('Sync failed', error);
    return false;
  }
};
