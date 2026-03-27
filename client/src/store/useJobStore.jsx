import { create } from 'zustand';
import api from '../services/api';

const useJobStore = create((set, get) => ({
  jobs: [],
  loading: false,
  filters: { status: '', search: '', sort: 'newest' },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),

  fetchJobs: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = { ...get().filters, ...filters };
      // Clear empty params
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/jobs', { params });
      set({ jobs: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addJob: async (jobData) => {
    const { data } = await api.post('/jobs', jobData);
    set((s) => ({ jobs: [data, ...s.jobs] }));
    return data;
  },

  updateJob: async (id, updates) => {
    const { data } = await api.put('/jobs/' + id, updates);
    set((s) => ({ jobs: s.jobs.map((j) => (j._id === id ? data : j)) }));
    return data;
  },

  deleteJob: async (id) => {
    await api.delete('/jobs/' + id);
    set((s) => ({ jobs: s.jobs.filter((j) => j._id !== id) }));
  },

  // Called by Socket.IO for real-time updates from other tabs
  syncJobUpdate: (updatedJob) => {
    set((s) => ({
      jobs: s.jobs.map((j) => (j._id === updatedJob._id ? updatedJob : j)),
    }));
  },

  syncJobDelete: (deletedId) => {
    set((s) => ({ jobs: s.jobs.filter((j) => j._id !== deletedId) }));
  },
}));

export default useJobStore;
