import { create } from 'zustand';
import { io } from 'socket.io-client';

const usePresenceStore = create((set, get) => ({
  socket: null,
  users: {}, // { userId: { x, y, name } }
  videos: {}, // { userId: HTMLVideoElement }
  
  setVideo: (userId, element) => {
    set((state) => ({
      videos: { ...state.videos, [userId]: element }
    }));
  },
  
  initSocket: (token) => {
    if (get().socket) return;
    
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });
    
    // Initial users in workspace
    socket.on('users_update', (workspaceUsers) => {
        const usersMap = {};
        workspaceUsers.forEach(u => {
          usersMap[u.userId] = u;
        });
        set({ users: usersMap });
    });

    // New user joined
    socket.on('user_joined', (userData) => {
      set((state) => ({
        users: { ...state.users, [userData.userId]: userData }
      }));
    });

    // Someone moved
    socket.on('user_moved', (userData) => {
      set((state) => ({
        users: { ...state.users, [userData.userId]: userData }
      }));
    });
    
    socket.on('user_left', (userId) => {
      set((state) => {
        const newUsers = { ...state.users };
        delete newUsers[userId];
        return { users: newUsers };
      });
    });
    
    set({ socket });
  },
  
  joinWorkspace: (workspaceId) => {
    const socket = get().socket;
    if (socket) {
      socket.emit('join_workspace', workspaceId);
    }
  },
  
  move: (x, y) => {
    const socket = get().socket;
    if (socket) {
      socket.emit('move', { x, y });
    }
  },
  
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, users: {} });
    }
  }
}));

export default usePresenceStore;
