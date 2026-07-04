import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types/Task';

export const storageKey = '@taskly_tasks';

export async function loadTasks(): Promise<Task[]> {
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Task[]) : [];
  } catch (error) {
    console.warn('AsyncStorage load failed:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]) {
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch (error) {
    console.warn('AsyncStorage save failed:', error);
  }
}
