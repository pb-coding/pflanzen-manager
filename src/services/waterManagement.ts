import { Plant, Task, PlantImage } from '../types/models';

export interface FigmaPlantView {
  id: string;
  name: string;
  imageUrl?: string;
  
  // Water Management aus Tasks ableiten
  nextWatering?: Date;
  lastWatered?: Date;
  wateringFrequencyDays?: number;
  wateringStatus: string; // "Water in X days"
  lastWateredText: string; // "Last watered X days ago"
  
  // Aus Plant.notes oder Tips
  notes?: string;
}

export interface WateringEntry {
  id: string;
  plantId: string;
  date: number;
  notes?: string;
}

/**
 * WaterManagementService - Service für Water Management Logic
 * Mapping zwischen bestehenden Daten und Figma UI
 */
export class WaterManagementService {
  /**
   * Mappt Plant + Tasks + Images zu FigmaPlantView
   */
  static mapPlantToFigmaView(
    plant: Plant, 
    tasks: Task[], 
    images: PlantImage[]
  ): FigmaPlantView {
    const wateringTasks = tasks.filter(t => 
      t.plantId === plant.id && 
      t.type === 'Watering'
    );
    
    const latestImage = images
      .filter(i => i.plantId === plant.id)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    const lastWatered = this.getLastWatering(wateringTasks);
    const nextWatering = this.calculateNextWatering(plant, wateringTasks);
    const frequency = this.getWateringFrequency(wateringTasks);
    
    return {
      id: plant.id,
      name: plant.name,
      imageUrl: latestImage?.dataURL,
      nextWatering: nextWatering || undefined,
      lastWatered: lastWatered || undefined,
      wateringFrequencyDays: frequency,
      wateringStatus: this.formatWateringStatus(nextWatering),
      lastWateredText: this.formatLastWatered(lastWatered),
      notes: '' // TODO: Aus Tips ableiten
    };
  }

  /**
   * Berechnet das nächste Bewässerungsdatum
   */
  static calculateNextWatering(plant: Plant, tasks: Task[]): Date | null {
    const completedWateringTasks = tasks
      .filter(t => 
        t.plantId === plant.id && 
        t.type === 'Watering' && 
        t.done &&
        t.completionHistory && 
        t.completionHistory.length > 0
      )
      .sort((a, b) => {
        const aLastCompletion = Math.max(...(a.completionHistory?.map(c => c.date) || [0]));
        const bLastCompletion = Math.max(...(b.completionHistory?.map(c => c.date) || [0]));
        return bLastCompletion - aLastCompletion;
      });

    if (completedWateringTasks.length === 0) return null;

    const lastTask = completedWateringTasks[0];
    const lastCompletion = Math.max(...(lastTask.completionHistory?.map(c => c.date) || [0]));
    const frequency = this.getWateringFrequency(tasks);
    
    if (frequency === 0) return null;
    
    return new Date(lastCompletion + (frequency * 24 * 60 * 60 * 1000));
  }

  /**
   * Ermittelt das letzte Bewässerungsdatum
   */
  static getLastWatering(tasks: Task[]): Date | null {
    const completedWateringTasks = tasks
      .filter(t => 
        t.type === 'Watering' && 
        t.done &&
        t.completionHistory && 
        t.completionHistory.length > 0
      );

    if (completedWateringTasks.length === 0) return null;

    const allCompletions = completedWateringTasks
      .flatMap(t => t.completionHistory || [])
      .sort((a, b) => b.date - a.date);

    return allCompletions.length > 0 ? new Date(allCompletions[0].date) : null;
  }

  /**
   * Ermittelt die Bewässerungsfrequenz in Tagen
   */
  static getWateringFrequency(tasks: Task[]): number {
    const recurringWateringTasks = tasks.filter(t => 
      t.type === 'Watering' && 
      t.recurring && 
      t.recurrencePattern
    );

    if (recurringWateringTasks.length === 0) return 7; // Default: 7 Tage

    const task = recurringWateringTasks[0];
    const pattern = task.recurrencePattern!;
    
    switch (pattern.unit) {
      case 'days':
        return pattern.interval;
      case 'weeks':
        return pattern.interval * 7;
      case 'months':
        return pattern.interval * 30; // Approximation
      default:
        return 7;
    }
  }

  /**
   * Formatiert den Bewässerungsstatus (z.B. "Water in 2 days")
   */
  static formatWateringStatus(nextWatering: Date | null): string {
    if (!nextWatering) return 'No watering schedule';
    
    const now = new Date();
    const diffMs = nextWatering.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Water today';
    } else if (diffDays === 1) {
      return 'Water in 1 day';
    } else {
      return `Water in ${diffDays} days`;
    }
  }

  /**
   * Formatiert das letzte Bewässerungsdatum (z.B. "Last watered 2d ago")
   */
  static formatLastWatered(lastWatered: Date | null): string {
    if (!lastWatered) return 'Never watered';
    
    const now = new Date();
    const diffMs = now.getTime() - lastWatered.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Last watered today';
    } else if (diffDays === 1) {
      return 'Last watered 1d ago';
    } else {
      return `Last watered ${diffDays}d ago`;
    }
  }

  /**
   * Fügt einen neuen Bewässerungseintrag hinzu
   */
  static async addWateringEntry(
    plantId: string, 
    date: Date = new Date(), 
    notes?: string,
    addTaskFn?: (task: Omit<Task, 'id'>) => Promise<string>
  ): Promise<string | null> {
    if (!addTaskFn) return null;

    const task: Omit<Task, 'id'> = {
      plantId,
      type: 'Watering',
      dueDate: date.getTime(),
      done: true,
      notes,
      recurring: false,
      createdAt: Date.now(),
      completionHistory: [{ 
        date: date.getTime(), 
        notes 
      }]
    };
    
    return await addTaskFn(task);
  }

  /**
   * Holt die Bewässerungshistorie für eine Pflanze
   */
  static getWateringHistory(plantId: string, tasks: Task[]): WateringEntry[] {
    const wateringTasks = tasks.filter(t => 
      t.plantId === plantId && 
      t.type === 'Watering' && 
      t.done &&
      t.completionHistory
    );

    const entries: WateringEntry[] = [];
    
    wateringTasks.forEach(task => {
      task.completionHistory?.forEach(completion => {
        entries.push({
          id: `${task.id}-${completion.date}`,
          plantId,
          date: completion.date,
          notes: completion.notes
        });
      });
    });

    return entries.sort((a, b) => b.date - a.date);
  }

  /**
   * Mappt mehrere Plants zu FigmaPlantViews
   */
  static mapPlantsToFigmaViews(
    plants: Plant[],
    tasks: Task[],
    images: PlantImage[]
  ): FigmaPlantView[] {
    return plants.map(plant => 
      this.mapPlantToFigmaView(plant, tasks, images)
    );
  }
}