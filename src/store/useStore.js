import { create } from 'zustand';
import { getDeviceId } from '../utils/identity';
import { getCachedLocation } from '../utils/location';

const useStore = create((set, get) => ({
  // Core Identity & Location
  deviceId: getDeviceId(),
  location: getCachedLocation() || null,
  setLocation: (loc) => set({ location: loc }),

  // Navigation State
  view: 'location', // 'location', 'rooms', 'chat'

  // Room State
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  activeRoomId: null,
  setActiveRoomId: (id) => set({ activeRoomId: id }),

  // Socket State (kept minimal here, actual socket instance handled in components/hooks)
  socketStatus: 'disconnected', // 'connecting', 'connected', 'disconnected', 'error'
  setSocketStatus: (status) => set({ socketStatus: status }),

  // Computed/Actions
  reset: () => set({ activeRoomId: null, view: 'rooms' }),

  // View transitions
  goToRooms: () => set({ view: 'rooms' }),
  goToChat: (roomId) => set({ activeRoomId: roomId, view: 'chat' }),
}));

export default useStore;
