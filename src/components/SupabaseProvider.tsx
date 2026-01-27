import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useCoachingStore } from '../store/coachingStore';

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeFromDb = useCoachingStore((state) => state.initializeFromDb);

  useEffect(() => {
    const initializeSupabase = async () => {
      if (isSupabaseConfigured()) {
        console.log('🔗 Laddar data från Supabase...');

        // Load coaching data from database (or sync defaults if DB is empty)
        // User is already authenticated via AuthProvider
        await initializeFromDb();

        console.log('✅ Data laddad från databasen');
      } else {
        console.log('ℹ️ Supabase inte konfigurerad - data sparas endast lokalt');
      }

      setIsInitialized(true);
    };

    initializeSupabase();
  }, [initializeFromDb]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Initialiserar Sales Coach...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
