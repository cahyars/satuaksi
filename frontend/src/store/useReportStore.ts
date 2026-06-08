import { create } from 'zustand';
import api from '@/services/api';
import { Report, ReportCategory } from '@/types';

interface ReportState {
  reports: Report[];
  myReports: Report[];
  categories: ReportCategory[];
  activeReport: Report | null;
  loading: boolean;
  error: string | null;
  fetchReports: (filters?: any) => Promise<void>;
  fetchMyReports: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchReportById: (id: string) => Promise<void>;
  createReport: (formData: FormData) => Promise<boolean>;
  verifyReport: (id: string, isVerified: boolean, status?: string) => Promise<boolean>;
  addComment: (reportId: string, content: string) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  updateReport: (id: string, data: Partial<Report>) => Promise<boolean>;
  addRealtimeReport: (report: Report) => void;
  updateRealtimeReport: (report: Report) => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  myReports: [],
  categories: [],
  activeReport: null,
  loading: false,
  error: null,

  fetchReports: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/reports?${params}`);
      set({ reports: res.data.reports, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load reports', loading: false });
    }
  },

  fetchMyReports: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/reports/my');
      set({ myReports: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load my reports', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await api.get('/categories');
      set({ categories: res.data });
    } catch (err) {
      console.error('Failed to load categories');
    }
  },

  fetchReportById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/reports/${id}`);
      set({ activeReport: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load report', loading: false });
    }
  },

  createReport: async (formData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to create report', loading: false });
      return false;
    }
  },

  verifyReport: async (id, isVerified, status = 'VERIFIED') => {
    try {
      const res = await api.put(`/reports/${id}`, { isVerified, status });
      const updatedReport = res.data;
      
      // Update local state lists
      set({
        reports: get().reports.map(r => r.id === id ? { ...r, ...updatedReport } : r),
        activeReport: get().activeReport?.id === id ? { ...get().activeReport, ...updatedReport } as Report : get().activeReport
      });
      return true;
    } catch (err) {
      console.error('Failed to verify report');
      return false;
    }
  },

  addComment: async (reportId, content) => {
    try {
      const res = await api.post(`/reports/${reportId}/comments`, { content });
      const newComment = res.data;
      
      if (get().activeReport && get().activeReport?.id === reportId) {
        set({
          activeReport: {
            ...get().activeReport!,
            comments: [newComment, ...(get().activeReport!.comments || [])]
          }
        });
      }
      return true;
    } catch (err) {
      console.error('Failed to add comment');
      return false;
    }
  },

  deleteReport: async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      set({
        reports: get().reports.filter(r => r.id !== id),
        myReports: get().myReports.filter(r => r.id !== id),
        activeReport: get().activeReport?.id === id ? null : get().activeReport
      });
      return true;
    } catch (err) {
      console.error('Failed to delete report');
      return false;
    }
  },

  updateReport: async (id, data) => {
    try {
      const res = await api.put(`/reports/${id}`, data);
      const updatedReport = res.data;
      set({
        reports: get().reports.map(r => r.id === id ? { ...r, ...updatedReport } : r),
        activeReport: get().activeReport?.id === id ? { ...get().activeReport, ...updatedReport } as Report : get().activeReport
      });
      return true;
    } catch (err) {
      console.error('Failed to update report');
      return false;
    }
  },

  addRealtimeReport: (report) => {
    // Add report if it's not already in list
    const exists = get().reports.some(r => r.id === report.id);
    if (!exists) {
      set({ reports: [report, ...get().reports] });
    }
  },

  updateRealtimeReport: (report) => {
    set({
      reports: get().reports.map(r => r.id === report.id ? { ...r, ...report } : r),
      activeReport: get().activeReport?.id === report.id ? { ...get().activeReport, ...report } as Report : get().activeReport
    });
  }
}));
