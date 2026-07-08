import { useEffect, useMemo, useState } from 'react';
import { loadTasks, saveTasks } from '../storage/Storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermission, scheduleReminder, cancelReminder } from '../services/NotificationService';
import type { Task, TaskCategory, TaskPriority, TaskReminder } from '../types/Task';
import { todayIso } from '../utils/date';

const USER_NAME_KEY = '@taskly_user_name';

function createTaskId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userName, setUserNameState] = useState('User');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const [storedTasks, name] = await Promise.all([loadTasks(), AsyncStorage.getItem(USER_NAME_KEY)]);

      if (!isMounted) {
        return;
      }

      // If a user action updated tasks before hydration finished, keep those edits.
      setTasks(current => {
        if (current.length === 0) {
          return storedTasks;
        }

        const existingIds = new Set(current.map(task => task.id));
        const missingStoredTasks = storedTasks.filter(task => !existingIds.has(task.id));
        return [...current, ...missingStoredTasks];
      });

      if (name) {
        setUserNameState(name);
      }

      setIsHydrated(true);
    })();

    requestNotificationPermission();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveTasks(tasks);
  }, [tasks, isHydrated]);

  const setUserName = (name: string) => {
    setUserNameState(name);
    AsyncStorage.setItem(USER_NAME_KEY, name);
  };

  const addTask = (input: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const createdTask: Task = {
      id: createTaskId(),
      completed: false,
      createdAt: Date.now(),
      ...input,
    };
    setTasks(current => [createdTask, ...current]);
    scheduleReminder(createdTask);
    return createdTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(current => current.map(task => (task.id === taskId ? { ...task, ...updates } : task)));
  };

  const toggleComplete = (taskId: string) => {
    setTasks(current => current.map(task => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  const removeTask = (taskId: string) => {
    cancelReminder(taskId);
    setTasks(current => current.filter(task => task.id !== taskId));
  };

  const clearCompleted = () => {
    setTasks(current => current.filter(task => !task.completed));
  };

  const counts = useMemo(() => {
    const today = todayIso();
    return {
      All: tasks.length,
      Today: tasks.filter(task => !task.completed && task.dueDate === today).length,
      Upcoming: tasks.filter(task => !task.completed && task.dueDate && task.dueDate > today).length,
      Completed: tasks.filter(task => task.completed).length,
    };
  }, [tasks]);

  const notificationCount = useMemo(() => {
    const today = todayIso();
    return tasks.filter(task => !task.completed && task.dueDate && task.dueDate <= today).length;
  }, [tasks]);

  const notificationTasks = useMemo(() => {
    const today = todayIso();
    return tasks.filter(task => !task.completed && task.dueDate && task.dueDate <= today);
  }, [tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    toggleComplete,
    removeTask,
    clearCompleted,
    counts,
    userName,
    setUserName,
    notificationCount,
    notificationTasks,
  };
}

export type { Task, TaskCategory, TaskPriority, TaskReminder };
