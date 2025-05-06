import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Room, Plant, PlantImage, Task, Tip, Settings } from '../types/models';

const DB_NAME = 'pflanzen-manager';
const DB_VERSION = 1;

interface PlantManagerDB extends DBSchema {
  rooms: {
    key: string;
    value: Room;
    indexes: { 'name': string };
  };
  plants: {
    key: string;
    value: Plant;
    indexes: { 'roomId': string; 'name': string };
  };
  images: {
    key: string;
    value: PlantImage;
    indexes: { 'plantId': string };
  };
  tasks: {
    key: string;
    value: Task;
    indexes: { 'plantId': string; 'dueDate': number; 'done': boolean };
  };
  tips: {
    key: string;
    value: Tip;
    indexes: { 'plantId': string };
  };
  settings: {
      key: string; // Use a fixed key like 'app-settings'
      value: Settings;
  };
}

let dbPromise: Promise<IDBPDatabase<PlantManagerDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PlantManagerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PlantManagerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('rooms')) {
          const roomStore = db.createObjectStore('rooms', { keyPath: 'id' });
          roomStore.createIndex('name', 'name');
        }
        if (!db.objectStoreNames.contains('plants')) {
          const plantStore = db.createObjectStore('plants', { keyPath: 'id' });
          plantStore.createIndex('roomId', 'roomId');
          plantStore.createIndex('name', 'name');
        }
        // ... create other stores and indexes similarly ...
        if (!db.objectStoreNames.contains('images')) {
            db.createObjectStore('images', { keyPath: 'id' }).createIndex('plantId', 'plantId');
        }
        if (!db.objectStoreNames.contains('tasks')) {
            const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
            taskStore.createIndex('plantId', 'plantId');
            taskStore.createIndex('dueDate', 'dueDate');
            taskStore.createIndex('done', 'done');
        }
        if (!db.objectStoreNames.contains('tips')) {
            db.createObjectStore('tips', { keyPath: 'id' }).createIndex('plantId', 'plantId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings'); // No keyPath, allows single entry with fixed key
        }
      },
    });
  }
  return dbPromise;
}

// --- Room Operations ---
export async function getAllRooms(): Promise<Room[]> {
  const db = await getDb();
  return db.getAll('rooms');
}

export async function addRoom(room: Omit<Room, 'id'>): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID(); // Generate unique ID
  const newRoom: Room = { ...room, id };
  await db.add('rooms', newRoom);
  return id;
}

export async function updateRoom(room: Room): Promise<void> {
  const db = await getDb();
  await db.put('rooms', room);
}


// --- Add other entity operations similarly (Plants, Images, Tasks, Tips, Settings) ---
// Example for Settings (using a fixed key)
const SETTINGS_KEY = 'app-settings';

export async function getSettings(): Promise<Settings | undefined> {
    const db = await getDb();
    return db.get('settings', SETTINGS_KEY);
}

export async function saveSettings(settings: Settings): Promise<void> {
    const db = await getDb();
    await db.put('settings', settings, SETTINGS_KEY);
}

// TODO: Implement remaining CRUD operations for Plant, PlantImage, Task, Tip
// --- Plant Operations ---
/** Get all active (non-archived) plants */
export async function getAllPlants(): Promise<Plant[]> {
  const db = await getDb();
  const allPlants = await db.getAll('plants');
  return allPlants.filter(p => !p.archived);
}

/** Get all archived plants (cemetery) */
export async function getArchivedPlants(): Promise<Plant[]> {
  const db = await getDb();
  const allPlants = await db.getAll('plants');
  return allPlants.filter(p => p.archived === true);
}
/** Get plants by room ID (only active plants) */
export async function getPlantsByRoomId(roomId: string): Promise<Plant[]> {
  const db = await getDb();
  const plants = await db.getAllFromIndex('plants', 'roomId', roomId);
  return plants.filter(p => !p.archived);
}
/** Get a single plant by ID */
export async function getPlant(id: string): Promise<Plant | undefined> {
  const db = await getDb();
  return db.get('plants', id);
}
/** Add a new plant */
export async function addPlant(plant: Omit<Plant, 'id'>): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const newPlant: Plant = { ...plant, id };
  await db.add('plants', newPlant);
  return id;
}
/** Update an existing plant */
export async function updatePlant(plant: Plant): Promise<void> {
  const db = await getDb();
  await db.put('plants', plant);
}
/** Archive a plant (move to cemetery) */
export async function archivePlant(id: string): Promise<void> {
  const db = await getDb();
  const plant = await db.get('plants', id);
  if (plant) {
    plant.archived = true;
    plant.archivedAt = Date.now();
    await db.put('plants', plant);
  }
}

/** Restore a plant from the cemetery */
export async function restorePlant(id: string): Promise<void> {
  const db = await getDb();
  const plant = await db.get('plants', id);
  if (plant) {
    plant.archived = false;
    plant.archivedAt = undefined;
    await db.put('plants', plant);
  }
}

/** Delete a plant (archive it instead of permanent deletion) */
export async function deletePlant(id: string): Promise<void> {
  await archivePlant(id);
}

/** Permanently delete a plant and cascade its images, tasks, tips */
export async function permanentlyDeletePlant(id: string): Promise<void> {
  const db = await getDb();
  // Delete associated images
  const images = await db.getAllFromIndex('images', 'plantId', id);
  for (const img of images) {
    await db.delete('images', img.id);
  }
  // Delete associated tasks
  const tasks = await db.getAllFromIndex('tasks', 'plantId', id);
  for (const task of tasks) {
    await db.delete('tasks', task.id);
  }
  // Delete associated tips
  const tips = await db.getAllFromIndex('tips', 'plantId', id);
  for (const tip of tips) {
    await db.delete('tips', tip.id);
  }
  // Delete the plant
  await db.delete('plants', id);
}

// --- PlantImage Operations ---
/** Get all images */
export async function getAllImages(): Promise<PlantImage[]> {
  const db = await getDb();
  return db.getAll('images');
}
/** Get images by plant ID */
export async function getImagesByPlantId(plantId: string): Promise<PlantImage[]> {
  const db = await getDb();
  return db.getAllFromIndex('images', 'plantId', plantId);
}
/** Add a new plant image */
export async function addImage(image: Omit<PlantImage, 'id'>): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const newImage: PlantImage = { ...image, id };
  await db.add('images', newImage);
  return id;
}
/** Update an existing plant image */
export async function updateImage(image: PlantImage): Promise<void> {
  const db = await getDb();
  await db.put('images', image);
}
/** Delete a plant image */
export async function deleteImage(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('images', id);
}

// --- Task Operations ---
/** Get all tasks */
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb();
  return db.getAll('tasks');
}
/** Get tasks by plant ID */
export async function getTasksByPlantId(plantId: string): Promise<Task[]> {
  const db = await getDb();
  return db.getAllFromIndex('tasks', 'plantId', plantId);
}
/** Add a new task */
export async function addTask(task: Omit<Task, 'id'>): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const newTask: Task = { ...task, id };
  await db.add('tasks', newTask);
  return id;
}
/** Update an existing task */
export async function updateTask(task: Task): Promise<void> {
  const db = await getDb();
  await db.put('tasks', task);
}
/** Delete a task */
export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('tasks', id);
}

// --- Tip Operations ---
/** Get all tips */
export async function getAllTips(): Promise<Tip[]> {
  const db = await getDb();
  return db.getAll('tips');
}
/** Get tips by plant ID */
export async function getTipsByPlantId(plantId: string): Promise<Tip[]> {
  const db = await getDb();
  return db.getAllFromIndex('tips', 'plantId', plantId);
}
/** Add a new tip */
export async function addTip(tip: Omit<Tip, 'id'>): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const newTip: Tip = { ...tip, id };
  await db.add('tips', newTip);
  return id;
}
/** Update an existing tip */
export async function updateTip(tip: Tip): Promise<void> {
  const db = await getDb();
  await db.put('tips', tip);
}
/** Delete a tip */
export async function deleteTip(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('tips', id);
}

// --- Settings Operations ---
/** Clear settings (delete stored settings) */
export async function clearSettings(): Promise<void> {
  const db = await getDb();
  await db.delete('settings', SETTINGS_KEY);
}

// --- Cascade delete for Room ---
/** Delete a room and all associated plants, images, tasks, tips */
export async function deleteRoom(id: string): Promise<void> {
  const db = await getDb();
  // Find and permanently delete associated plants (which cascades)
  const plants = await db.getAllFromIndex('plants', 'roomId', id);
  for (const plant of plants) {
    await permanentlyDeletePlant(plant.id);
  }
  // Delete the room itself
  await db.delete('rooms', id);
}
