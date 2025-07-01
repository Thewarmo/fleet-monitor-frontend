import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';
import * as realtimeService from '../services/realtimeService';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock authService and realtimeService
jest.mock('../services/authService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn(),
  setAuthHeader: jest.fn(),
}));

jest.mock('../services/realtimeService', () => ({
  realtimeService: {
    startConnection: jest.fn(),
    stopConnection: jest.fn(),
    onReceiveLowFuelAlert: jest.fn(),
    offReceiveLowFuelAlert: jest.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should provide initial authentication state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should log in a user successfully', async () => {
    (authService.login as jest.Mock).mockResolvedValue(true);
    localStorageMock.setItem('jwt_token', 'header.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGVzIjpbInVzZXIiXX0.signature');

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      const success = await result.current.login('testuser', 'password');
      expect(success).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({ username: 'testuser', roles: ['user'] });
      expect(result.current.loading).toBe(false);
      expect(realtimeService.realtimeService.startConnection).toHaveBeenCalledWith('header.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGVzIjpbInVzZXIiXX0.signature');
    });
  });

  it('should handle login failure', async () => {
    (authService.login as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      const success = await result.current.login('testuser', 'wrongpassword');
      expect(success).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(realtimeService.realtimeService.startConnection).not.toHaveBeenCalled();
    });
  });

  it('should log out a user successfully', async () => {
    // Simulate already logged in
    localStorageMock.setItem('jwt_token', 'some.valid.token');
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Wait for initial useEffect to process token
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorageMock.getItem('jwt_token')).toBeNull();
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(realtimeService.realtimeService.stopConnection).toHaveBeenCalledTimes(1);
    });
  });

  it('should restore authentication from localStorage on mount', async () => {
    localStorageMock.setItem('jwt_token', 'header.eyJzdWIiOiJsb2NhbHVzZXIiLCJyb2xlcyI6WyJhZG1pbiJdfQ.signature');

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({ username: 'localuser', roles: ['admin'] });
      expect(result.current.loading).toBe(false);
      expect(realtimeService.realtimeService.startConnection).toHaveBeenCalledWith('header.eyJzdWIiOiJsb2NhbHVzZXIiLCJyb2xlcyI6WyJhZG1pbiJdfQ.signature');
    });
  });
});