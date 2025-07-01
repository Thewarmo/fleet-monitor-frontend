'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as authLogin, logout as authLogout } from '../services/authService';
import { realtimeService } from '../services/realtimeService';
import { getVehiclesByUserId } from '../services/vehicleService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; username: string; roles: string[] } | null; // Added id: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; roles: string[] } | null>(null); // Added id: string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      // In a real application, you would validate the token with the backend
      // and fetch user details. For now, we'll assume it's valid.
      setIsAuthenticated(true);
      // Decode token to get user info (e.g., username, roles)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Assuming the payload contains a 'sub' field which is the user ID
        setUser({ id: payload.sub, username: payload.sub, roles: payload.roles || [] }); // Assuming 'sub' is the ID
        realtimeService.startConnection(token); // Start SignalR connection
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('jwt_token');
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const success = await authLogin(username, password);
      if (success) {
        setIsAuthenticated(true);
        // Re-fetch user info after successful login
        const token = localStorage.getItem('jwt_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Assuming the payload contains a 'sub' field which is the user ID
            const userId = payload.sub; // Extract user ID
            setUser({ id: userId, username: payload.sub, roles: payload.roles || [] }); // Assuming 'sub' is the ID
            realtimeService.startConnection(token); // Start SignalR connection

            // Fetch vehicles by user ID and store in local storage
            if (userId) {
                const vehicles = await getVehiclesByUserId(userId);
                localStorage.setItem('user_vehicles', JSON.stringify(vehicles));
            }

          } catch (error) {
            console.error('Failed to decode token after login:', error);
          }
        }
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
    setUser(null);
    realtimeService.stopConnection(); // Stop SignalR connection
    localStorage.removeItem('user_vehicles'); // Clear vehicles from local storage on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
