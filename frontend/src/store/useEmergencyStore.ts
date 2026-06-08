import { create } from 'zustand';
import api from '@/services/api';
import { EmergencyAlert } from '@/types';

interface EmergencyState {
  activeAlerts: EmergencyAlert[];
  myAlerts: EmergencyAlert[];
  isSosTriggered: boolean;
  activeSosId: string | null;
  loading: boolean;
  error: string | null;
  fetchActiveAlerts: () => Promise<void>;
  fetchMyAlerts: () => Promise<void>;
  triggerSos: (data: { 
    type: string; 
    latitude: number; 
    longitude: number; 
    message?: string; 
    isSilent?: boolean;
    accuracy?: number;
    altitude?: number | null;
    speed?: number | null;
  }) => Promise<EmergencyAlert | null>;
  resolveAlert: (id: string, status: 'RESOLVED' | 'CANCELLED') => Promise<boolean>;
  setSosTriggered: (isTriggered: boolean) => void;
  addRealtimeAlert: (alert: EmergencyAlert) => void;
  updateRealtimeAlert: (alert: EmergencyAlert) => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  activeAlerts: [],
  myAlerts: [],
  isSosTriggered: typeof window !== 'undefined' ? !!localStorage.getItem('lifeline_active_sos_id') : false,
  activeSosId: typeof window !== 'undefined' ? localStorage.getItem('lifeline_active_sos_id') : null,
  loading: false,
  error: null,

  fetchActiveAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/emergency?status=ACTIVE');
      set({ activeAlerts: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load emergencies', loading: false });
    }
  },

  fetchMyAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/emergency/my');
      set({ myAlerts: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load history', loading: false });
    }
  },

  triggerSos: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/emergency', data);
      const alert = res.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('lifeline_active_sos_id', alert.id);
      }
      set({ isSosTriggered: true, activeSosId: alert.id, loading: false });
      return alert;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to trigger SOS', loading: false });
      return null;
    }
  },

  resolveAlert: async (id, status) => {
    try {
      const res = await api.put(`/emergency/${id}`, { status });
      const updated = res.data;
      
      const activeSosId = get().activeSosId;
      if (id === activeSosId) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lifeline_active_sos_id');
        }
        set({ isSosTriggered: false, activeSosId: null });
      }

      set({
        activeAlerts: get().activeAlerts.filter(a => a.id !== id),
        myAlerts: get().myAlerts.map(a => a.id === id ? { ...a, ...updated } : a)
      });
      return true;
    } catch (err) {
      console.error('Failed to update SOS alert status');
      return false;
    }
  },

  setSosTriggered: (isTriggered) => {
    if (!isTriggered && typeof window !== 'undefined') {
      localStorage.removeItem('lifeline_active_sos_id');
    }
    set({ isSosTriggered: isTriggered, activeSosId: isTriggered ? get().activeSosId : null });
  },

  addRealtimeAlert: (alert) => {
    const exists = get().activeAlerts.some(a => a.id === alert.id);
    if (!exists) {
      set({ activeAlerts: [alert, ...get().activeAlerts] });
    }
  },

  updateRealtimeAlert: (alert) => {
    if (alert.status === 'RESOLVED' || alert.status === 'CANCELLED') {
      set({ activeAlerts: get().activeAlerts.filter(a => a.id !== alert.id) });
      if (alert.id === get().activeSosId) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lifeline_active_sos_id');
        }
        set({ isSosTriggered: false, activeSosId: null });
      }
    } else {
      set({
        activeAlerts: get().activeAlerts.map(a => a.id === alert.id ? { ...a, ...alert } : a)
      });
    }
  }
}));
