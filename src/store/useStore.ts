import { create } from 'zustand';
import { Room, Plant, PlantImage, Task, Tip, Settings } from '../types/models';
import *
  as db
from '../services/db';

interface AppState {
  rooms: Room[];
  isLoadingRooms: boolean;
  errorLoadingRooms: string | null;

  // TODO: Add state for plants, images, tasks, tips, settings

  // Actions
  loadRooms: () => Promise<void>;
  addRoom: (roomData: Omit<Room, 'id'>) => Promise<string>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  rooms: [],
  isLoadingRooms: false,
  errorLoadingRooms: null,

  loadRooms: async () => {
    set({ isLoadingRooms: true, errorLoadingRooms: null });
    try {
      const rooms = await db.getAllRooms();
      set({ rooms, isLoadingRooms: false });
    } catch (error) {
      console.error('Failed to load rooms:', error);
      set({ isLoadingRooms: false, errorLoadingRooms: 'Failed to load rooms' });
    }
  },

  addRoom: async (roomData) => {
      const newId = await db.addRoom(roomData);
      // Reload rooms after adding
      set((state) => { state.loadRooms(); return {}; });
      return newId;
  },

  updateRoom: async (room) => {
      await db.updateRoom(room);
      // Reload rooms after updating
      set((state) => { state.loadRooms(); return {}; });
  },

  deleteRoom: async (id) => {
      await db.deleteRoom(id);
      // Reload rooms after deleting
      set((state) => { state.loadRooms(); return {}; });
  },
}));
