// Fix: Import Dispatch and SetStateAction to resolve React namespace errors.
import type { Dispatch, SetStateAction } from 'react';

export interface CalorieEntry {
  id: string;
  day: string;
  target: number | null;
  exercise: number | null;
  intake: number | null;
}

export type WorkoutType = 'Push' | 'Pull' | 'Legs' | 'Rest' | '';

export interface WorkoutEntry {
  type: WorkoutType;
  steps: number | null;
}

export type WorkoutData = Record<string, WorkoutEntry>;

export interface WeightEntry {
  id?: string;
  date: string;
  weight: number;
}

export type Page = 'dashboard' | 'calorie-tracker' | 'workout-logger' | 'weight-tracker';

export interface AppData {
  calorieData: CalorieEntry[];
  workoutData: WorkoutData;
  weightData: WeightEntry[];
  maintenanceCalories: number;
  stepGoal: number;
  weightGoal: number;
}

export interface AppContextType extends AppData {
  setCurrentPage: Dispatch<SetStateAction<Page>>;
  setMaintenanceCalories: Dispatch<SetStateAction<number>>;
  setStepGoal: Dispatch<SetStateAction<number>>;
  setWeightGoal: Dispatch<SetStateAction<number>>;
  // New Firestore-based functions
  addCalorieEntry: (entry: Omit<CalorieEntry, 'id'>) => Promise<void>;
  updateCalorieEntry: (id: string, updates: Partial<CalorieEntry>) => Promise<void>;
  deleteCalorieEntry: (id: string) => Promise<void>;
  clearAllCalorieData: () => Promise<void>;
  importCalorieData: (data: CalorieEntry[]) => Promise<void>;
  saveWorkoutData: (data: WorkoutData) => Promise<void>;
  saveWeightEntry: (entry: Omit<WeightEntry, 'id'>) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
}