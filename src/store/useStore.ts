import { create } from 'zustand';
import { Room, Plant, PlantImage, Task, Tip, Settings } from '../types/models';
import *
  as db
from '../services/db';

interface AppState {
  // Rooms
  rooms: Room[];
  isLoadingRooms: boolean;
  errorLoadingRooms: string | null;

  // Plants
  plants: Plant[];
  isLoadingPlants: boolean;
  errorLoadingPlants: string | null;

  // Plant Images
  images: PlantImage[];
  isLoadingImages: boolean;
  errorLoadingImages: string | null;

  // Tasks
  tasks: Task[];
  isLoadingTasks: boolean;
  errorLoadingTasks: string | null;

  // Tips
  tips: Tip[];
  isLoadingTips: boolean;
  errorLoadingTips: string | null;

  // Settings
  settings?: Settings;
  isLoadingSettings: boolean;
  errorLoadingSettings: string | null;

  // Actions for Rooms
  loadRooms: () => Promise<void>;
  addRoom: (roomData: Omit<Room, 'id'>) => Promise<string>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;

  // Actions for Plants
  loadPlants: () => Promise<void>;
  addPlant: (plantData: Omit<Plant, 'id'>) => Promise<string>;
  updatePlant: (plant: Plant) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;

  // Actions for Images
  loadImages: () => Promise<void>;
  addImage: (imageData: Omit<PlantImage, 'id'>) => Promise<string>;
  updateImage: (image: PlantImage) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;

  // Actions for Tasks
  loadTasks: () => Promise<void>;
  addTask: (taskData: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Actions for Tips
  loadTips: () => Promise<void>;
  addTip: (tipData: Omit<Tip, 'id'>) => Promise<string>;
  updateTip: (tip: Tip) => Promise<void>;
  deleteTip: (id: string) => Promise<void>;

  // Actions for Settings
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  clearSettings: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  rooms: [],
  isLoadingRooms: false,
  errorLoadingRooms: null,
  plants: [],
  isLoadingPlants: false,
  errorLoadingPlants: null,
  images: [],
  isLoadingImages: false,
  errorLoadingImages: null,
  tasks: [],
  isLoadingTasks: false,
  errorLoadingTasks: null,
  tips: [],
  isLoadingTips: false,
  errorLoadingTips: null,
  settings: undefined,
  isLoadingSettings: false,
  errorLoadingSettings: null,

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
    await get().loadRooms();
    return newId;
  },

  updateRoom: async (room) => {
    await db.updateRoom(room);
    await get().loadRooms();
  },

  deleteRoom: async (id) => {
    await db.deleteRoom(id);
    await Promise.all([
      get().loadRooms(),
      get().loadPlants(),
      get().loadImages(),
      get().loadTasks(),
      get().loadTips(),
    ]);
  },
  // --- Plant Actions ---
  loadPlants: async () => {
    set({ isLoadingPlants: true, errorLoadingPlants: null });
    try {
      const plants = await db.getAllPlants();
      set({ plants, isLoadingPlants: false });
    } catch (error) {
      console.error('Failed to load plants:', error);
      set({ isLoadingPlants: false, errorLoadingPlants: 'Failed to load plants' });
    }
  },
  addPlant: async (plantData) => {
    const newId = await db.addPlant(plantData);
    await get().loadPlants();
    return newId;
  },
  updatePlant: async (plant) => {
    await db.updatePlant(plant);
    await get().loadPlants();
  },
  deletePlant: async (id) => {
    await db.deletePlant(id);
    await Promise.all([
      get().loadPlants(),
      get().loadImages(),
      get().loadTasks(),
      get().loadTips(),
    ]);
  },
  // --- Image Actions ---
  loadImages: async () => {
    set({ isLoadingImages: true, errorLoadingImages: null });
    try {
      const images = await db.getAllImages();
      set({ images, isLoadingImages: false });
    } catch (error) {
      console.error('Failed to load images:', error);
      set({ isLoadingImages: false, errorLoadingImages: 'Failed to load images' });
    }
  },
  addImage: async (imageData) => {
    const newId = await db.addImage(imageData);
    await get().loadImages();
    return newId;
  },
  updateImage: async (image) => {
    await db.updateImage(image);
    await get().loadImages();
  },
  deleteImage: async (id) => {
    await db.deleteImage(id);
    await get().loadImages();
  },
  // --- Task Actions ---
  loadTasks: async () => {
    set({ isLoadingTasks: true, errorLoadingTasks: null });
    try {
      const tasks = await db.getAllTasks();
      set({ tasks, isLoadingTasks: false });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ isLoadingTasks: false, errorLoadingTasks: 'Failed to load tasks' });
    }
  },
  addTask: async (taskData) => {
    const newId = await db.addTask(taskData);
    await get().loadTasks();
    return newId;
  },
  updateTask: async (task) => {
    await db.updateTask(task);
    await get().loadTasks();
  },
  deleteTask: async (id) => {
    await db.deleteTask(id);
    await get().loadTasks();
  },
  // --- Tip Actions ---
  loadTips: async () => {
    set({ isLoadingTips: true, errorLoadingTips: null });
    try {
      const tips = await db.getAllTips();
      set({ tips, isLoadingTips: false });
    } catch (error) {
      console.error('Failed to load tips:', error);
      set({ isLoadingTips: false, errorLoadingTips: 'Failed to load tips' });
    }
  },
  addTip: async (tipData) => {
    const newId = await db.addTip(tipData);
    await get().loadTips();
    return newId;
  },
  updateTip: async (tip) => {
    await db.updateTip(tip);
    await get().loadTips();
  },
  deleteTip: async (id) => {
    await db.deleteTip(id);
    await get().loadTips();
  },
  // --- Settings Actions ---
  loadSettings: async () => {
    set({ isLoadingSettings: true, errorLoadingSettings: null });
    try {
      const settings = await db.getSettings();
      set({ settings, isLoadingSettings: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoadingSettings: false, errorLoadingSettings: 'Failed to load settings' });
    }
  },
  saveSettings: async (settings) => {
    await db.saveSettings(settings);
    await get().loadSettings();
  },
  clearSettings: async () => {
    await db.clearSettings();
    set({ settings: undefined });
  },
}));
