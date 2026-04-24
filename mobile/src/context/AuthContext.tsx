import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB } from '../database';

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextData {
  user: User | null;
  signIn: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const db = await openDB();
      const result = await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
      if (result) {
        setUser(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (userData: User) => {
    try {
      const db = await openDB();
      // Keep only one logged in user locally
      await db.execAsync('DELETE FROM users');
      await db.runAsync(
        'INSERT INTO users (id, name, email, token) VALUES (?, ?, ?, ?)',
        userData.id, userData.name, userData.email, userData.token
      );
      setUser(userData);
    } catch (e) {
      console.error('SignIn error', e);
    }
  };

  const signOut = async () => {
    try {
      const db = await openDB();
      await db.execAsync('DELETE FROM users');
      setUser(null);
    } catch (e) {
      console.error('SignOut error', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
