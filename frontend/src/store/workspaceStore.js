import { create } from 'zustand';
import api from '@/lib/api';

const useWorkspaceStore = create((set) => ({
  workspaces: [],
  currentWorkspace: null,
  
  fetchWorkspaces: async () => {
    try {
      const { data } = await api.get('/workspaces');
      set({ workspaces: data });
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
      throw error;
    }
  },
  
  createWorkspace: async (name) => {
    const { data } = await api.post('/workspaces/create', { name });
    set((state) => ({ workspaces: [...state.workspaces, data] }));
    return data;
  },
  
  joinWorkspace: async (inviteCode) => {
    const { data } = await api.post('/workspaces/join', { inviteCode });
    set((state) => ({ workspaces: [...state.workspaces, data] }));
  },
  
  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
  }
}));

export default useWorkspaceStore;
