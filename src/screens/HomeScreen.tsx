import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Header } from '../components/Header';
import { ProgressCard } from '../components/ProgressCard';
import { FilterTabs } from '../components/FilterTabs';
import { TaskCard } from '../components/TaskCard';
import { FloatingButton } from '../components/FloatingButton';
import { AddTaskModal } from '../components/AddTaskModal';
import { useTheme } from '../theme/ThemeContext';
import type { FilterTab, Task } from '../types/Task';
import { todayIso } from '../utils/date';

type HomeScreenProps = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleComplete: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  counts: Record<FilterTab, number>;
  activeTab: FilterTab;
  setActiveTab: (tab: FilterTab) => void;
  userName: string;
  notificationCount: number;
  notificationTasks: Task[];
};

export function HomeScreen({ tasks, addTask, updateTask, toggleComplete, removeTask, clearCompleted, counts, activeTab, setActiveTab, userName, notificationCount, notificationTasks }: HomeScreenProps) {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const today = todayIso();
  const sortedTasks = useMemo(() => {
    const next = [...tasks].sort((a, b) => {
      const aDue = a.dueDate ?? '9999-99-99';
      const bDue = b.dueDate ?? '9999-99-99';
      const dueDiff = aDue.localeCompare(bDue);
      if (dueDiff !== 0) return dueDiff;
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.createdAt - b.createdAt;
    });
    return next;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'Today':
        return sortedTasks.filter(task => !task.completed && task.dueDate === today);
      case 'Upcoming':
        return sortedTasks.filter(task => !task.completed && task.dueDate && task.dueDate > today);
      case 'Completed':
        return sortedTasks.filter(task => task.completed);
      default:
        return sortedTasks;
    }
  }, [activeTab, sortedTasks, today]);

  const completed = sortedTasks.filter(task => task.completed).length;
  const remaining = sortedTasks.length - completed;
  const progress = sortedTasks.length === 0 ? 0 : Math.round((completed / sortedTasks.length) * 100);

  const handleSave = (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, task);
    } else {
      addTask(task);
    }
    setEditingTask(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <Header name={userName} notificationCount={notificationCount} notificationTasks={notificationTasks} />
      <ProgressCard completed={completed} total={sortedTasks.length} remaining={remaining} />
      <FilterTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyBody}>Add one to start building momentum.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={toggleComplete}
            onDelete={removeTask}
            onPress={() => {
              setEditingTask(item);
              setShowModal(true);
            }}
          />
        )}
      />
      <View style={styles.fabContainer}>
        <FloatingButton onPress={() => setShowModal(true)} />
      </View>
      <AddTaskModal
        visible={showModal}
        initialTask={editingTask}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef5ff',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 6,
  },
  emptyBody: {
    color: '#64748b',
    fontSize: 13,
  },
  fabContainer: {
    position: 'absolute',
    right: 22,
    bottom: 24,
  },
});
