import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types/Task';

export const storageKey = '@taskly_tasks';
export const customCategoriesKey = '@taskly_custom_categories';

function sanitizeCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const normalized = raw
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return Array.from(new Set(normalized));
}

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

export async function loadCustomCategories(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(customCategoriesKey);
    if (!stored) {
      return [];
    }

    return sanitizeCategories(JSON.parse(stored));
  } catch (error) {
    console.warn('AsyncStorage custom categories load failed:', error);
    return [];
  }
}

export async function saveCustomCategories(categories: string[]) {
  try {
    const sanitized = sanitizeCategories(categories);
    await AsyncStorage.setItem(customCategoriesKey, JSON.stringify(sanitized));
  } catch (error) {
    console.warn('AsyncStorage custom categories save failed:', error);
  }
}
