import { Task } from '../types/models';
import { PlantCareTips } from './openai';

/**
 * Extracts time intervals from text descriptions.
 * For example, "alle 7-10 Tage gießen" would return { min: 7, max: 10, unit: 'days' }
 */
function extractTimeInterval(text: string): { min: number; max: number; unit: 'days' | 'weeks' | 'months' } | null {
  // Look for patterns like "alle X-Y Tage/Wochen/Monate"
  const rangePattern = /alle\s+(\d+)[-\s]*(\d+)\s+(Tag|Tage|Woche|Wochen|Monat|Monate)/i;
  const singlePattern = /alle\s+(\d+)\s+(Tag|Tage|Woche|Wochen|Monat|Monate)/i;
  const numberPattern = /(\d+)\s+(Tag|Tage|Woche|Wochen|Monat|Monate)/i;
  
  let match = text.match(rangePattern);
  if (match) {
    const min = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);
    const unit = normalizeTimeUnit(match[3]);
    return { min, max, unit };
  }
  
  match = text.match(singlePattern);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = normalizeTimeUnit(match[2]);
    return { min: value, max: value, unit };
  }
  
  match = text.match(numberPattern);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = normalizeTimeUnit(match[2]);
    return { min: value, max: value, unit };
  }
  
  return null;
}

/**
 * Normalizes time units to a standard format
 */
function normalizeTimeUnit(unit: string): 'days' | 'weeks' | 'months' {
  unit = unit.toLowerCase();
  if (unit === 'tag' || unit === 'tage') return 'days';
  if (unit === 'woche' || unit === 'wochen') return 'weeks';
  if (unit === 'monat' || unit === 'monate') return 'months';
  // Default to days if unknown unit
  return 'days';
}

/**
 * Converts a time interval to milliseconds
 */
function intervalToMs(value: number, unit: string): number {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const WEEK_MS = 7 * DAY_MS;
  const MONTH_MS = 30 * DAY_MS; // Approximation
  
  switch (unit) {
    case 'days': return value * DAY_MS;
    case 'weeks': return value * WEEK_MS;
    case 'months': return value * MONTH_MS;
    default: return value * DAY_MS;
  }
}

/**
 * Generates tasks based on plant care tips
 * 
 * @param plantId The ID of the plant
 * @param careTips Care tips from OpenAI analysis
 * @returns Array of tasks without IDs (to be added when saving to DB)
 */
export function generateTasksFromTips(
  plantId: string,
  careTips: PlantCareTips
): Omit<Task, 'id'>[] {
  const now = Date.now();
  const tasks: Omit<Task, 'id'>[] = [];
  
  // Generate watering task
  const wateringInterval = extractTimeInterval(careTips.watering);
  if (wateringInterval) {
    // Use the minimum value for the first task
    const dueDate = now + intervalToMs(wateringInterval.min, wateringInterval.unit);
    tasks.push({
      plantId,
      type: 'Watering',
      dueDate,
      done: false,
      notes: careTips.watering,
      recurring: true,
      recurrencePattern: {
        interval: wateringInterval.min,
        unit: wateringInterval.unit,
        seasonalAdjustment: true
      },
      createdAt: now,
      completionHistory: []
    });
  }
  
  // Generate fertilizing task
  const fertilizingInterval = extractTimeInterval(careTips.fertilizing);
  if (fertilizingInterval) {
    const dueDate = now + intervalToMs(fertilizingInterval.min, fertilizingInterval.unit);
    tasks.push({
      plantId,
      type: 'Fertilizing',
      dueDate,
      done: false,
      notes: careTips.fertilizing,
      recurring: true,
      recurrencePattern: {
        interval: fertilizingInterval.min,
        unit: fertilizingInterval.unit,
        seasonalAdjustment: true
      },
      createdAt: now,
      completionHistory: []
    });
  }
  
  // Generate repotting task if needed
  if (careTips.repotting.toLowerCase().includes('umtopfen') && 
      !careTips.repotting.toLowerCase().includes('nicht umtopfen')) {
    // Set repotting task for 2 weeks from now if specific timing not found
    const repottingInterval = extractTimeInterval(careTips.repotting) || { min: 2, max: 2, unit: 'weeks' };
    const dueDate = now + intervalToMs(repottingInterval.min, repottingInterval.unit);
    tasks.push({
      plantId,
      type: 'Repotting',
      dueDate,
      done: false,
      notes: careTips.repotting,
      recurring: false, // Repotting is typically not a recurring task
      createdAt: now,
      completionHistory: []
    });
  }
  
  // Generate cleaning task if health issues are detected
  if (careTips.health.toLowerCase().includes('schädling') || 
      careTips.health.toLowerCase().includes('reinig') ||
      careTips.health.toLowerCase().includes('staub')) {
    tasks.push({
      plantId,
      type: 'Cleaning',
      dueDate: now + intervalToMs(3, 'days'), // Set cleaning task for 3 days from now
      done: false,
      notes: careTips.health,
      recurring: true,
      recurrencePattern: {
        interval: 2,
        unit: 'weeks',
        seasonalAdjustment: false
      },
      createdAt: now,
      completionHistory: []
    });
  }
  
  // Generate photo task for 4 weeks from now to track progress
  tasks.push({
    plantId,
    type: 'Photo',
    dueDate: now + intervalToMs(4, 'weeks'),
    done: false,
    notes: 'Neues Foto erstellen, um den Fortschritt zu dokumentieren.',
    recurring: true,
    recurrencePattern: {
      interval: 4,
      unit: 'weeks',
      seasonalAdjustment: false
    },
    createdAt: now,
    completionHistory: []
  });
  
  return tasks;
}

/**
 * Formats care tips into a single formatted string for display
 */
export function formatCareTipsForDisplay(careTips: PlantCareTips): string {
  return `
**Gießen**: ${careTips.watering}

**Düngen**: ${careTips.fertilizing}

**Umtopfen**: ${careTips.repotting}

**Standort**: ${careTips.location}

**Gesundheit**: ${careTips.health}

**Luftfeuchtigkeit**: ${careTips.spraying}
  `.trim();
}
