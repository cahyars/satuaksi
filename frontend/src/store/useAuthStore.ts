import { create } from 'zustand';
import api from '@/services/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (formData: FormData) => Promise<boolean>;
  changePassword: (data: any) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('lifeline_token') : null,
  loading: false,
  error: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('lifeline_token') : false,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', credentials);
      const { user, token } = res.data;
      localStorage.setItem('lifeline_token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/register', data);
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('lifeline_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/auth/profile');
      set({ user: res.data, isAuthenticated: true, loading: false });
    } catch (err: any) {
      const status = err?.response?.status;
      // On 401 (token expired/invalid), clear session completely
      if (status === 401) {
        get().logout();
      } else {
        // For network errors or other failures, if we have no user data,
        // clear the auth state to prevent stuck loading states
        const currentUser = get().user;
        if (!currentUser) {
          localStorage.removeItem('lifeline_token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      }
      set({ loading: false });
      throw err; // Re-throw so callers can handle
    }
  },

  updateProfile: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ user: res.data, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update profile', loading: false });
      return false;
    }
  },

  changePassword: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.put('/auth/change-password', data);
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to change password', loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
