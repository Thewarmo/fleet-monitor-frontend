'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api'; // tu instancia de Axios

interface UseOfflineDataOptions {
  key: string;
  initialValue?: any;
}

export const useOfflineData = <T>({ key, initialValue }: UseOfflineDataOptions) => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prevValue: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, value]);

  useEffect(() => {
    // Optional: Add event listener for storage changes across tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [key]);

  return [value, setStoredValue] as const;
};

export const getVehicleByUser = async (userId: string) => {
  const token = localStorage.getItem('jwt_token');
  const response = await api.get(`/Vehicles/by-user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
