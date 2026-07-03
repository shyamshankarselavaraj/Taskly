/**
 * Taskly - polished task manager UI.
 *
 * @format
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let DateTimePicker: any = null;
try {
  // @ts-ignore
  const dt = require('@react-native-community/datetimepicker');
  DateTimePicker = dt && (dt.default ?? dt);
} catch {
  DateTimePicker = null;
}

type TodoTask = {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  createdAt: number;
};

function todayIso() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function formatDueDate(date?: string) {
  if (!date) return 'No due date';
  const parsed = new Date(date);
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function greetingText() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef5ff" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TasklyApp />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TasklyApp() {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [title, setTitle] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState<string | undefined>(undefined);
  const [pickerDate, setPickerDate] = useState(todayIso());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Today' | 'Upcoming' | 'Completed'>('All');

  const storageKey = '@taskly_tasks';

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as TodoTask[];
      }
    } catch (error) {
      console.warn('AsyncStorage load failed:', error);
    }
    return [];
  };

  const saveTasks = async (nextTasks: TodoTask[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextTasks));
    } catch (error) {
      console.warn('AsyncStorage save failed:', error);
    }
  };

  useEffect(() => {
    loadTasks().then(stored => {
      if (stored.length) setTasks(stored);
    });
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const today = todayIso();

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate) || a.createdAt - b.createdAt;
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return a.createdAt - b.createdAt;
    });
  }, [tasks]);

  const overdue = sortedTasks.filter(task => task.dueDate && task.dueDate < today && !task.completed);
  const todayTasks = sortedTasks.filter(task => task.dueDate === today && !task.completed);
  const upcoming = sortedTasks.filter(task => task.dueDate && task.dueDate > today && !task.completed);
  const completed = sortedTasks.filter(task => task.completed);

  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'Today':
        return todayTasks;
      case 'Upcoming':
        return upcoming;
      case 'Completed':
        return completed;
      default:
        return sortedTasks;
    }
  }, [activeTab, sortedTasks, todayTasks, upcoming, completed]);

  const remaining = sortedTasks.length - completed.length;
  const progress = sortedTasks.length === 0 ? 0 : Math.round((completed.length / sortedTasks.length) * 100);

  const onAddTask = () => {
    if (!title.trim()) return;
    const newTask: TodoTask = {
      id: String(Date.now()),
      title: title.trim(),
      dueDate: selectedDueDate,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(current => [newTask, ...current]);
    setTitle('');
    setSelectedDueDate(undefined);
    setPickerDate(today);
    setShowAddModal(false);
  };

  const toggleComplete = (id: string) => {
    setTasks(current => current.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const removeTask = (id: string) => {
    setTasks(current => current.filter(task => task.id !== id));
  };

  const openDueDate = () => {
    setPickerDate(selectedDueDate ?? today);
    if (Platform.OS === 'android') {
      setShowAndroidPicker(true);
    } else {
      setShowDateModal(true);
    }
  };

  const onDateChange = (event: any, selected?: Date) => {
    if (event?.type === 'dismissed') {
      setShowAndroidPicker(false);
      return;
    }
    const nextDate = selected || new Date(pickerDate);
    const iso = nextDate.toISOString().split('T')[0];
    setPickerDate(iso);
    setSelectedDueDate(iso);
    setShowAndroidPicker(false);
  };

  const renderTask = ({ item }: { item: TodoTask }) => {
    const activeColor = item.completed ? '#22c55e' : item.dueDate ? '#f97316' : '#60a5fa';
    return (
      <View style={[styles.taskCard, { borderLeftColor: activeColor }]}>
        <Pressable onPress={() => toggleComplete(item.id)} style={[styles.checkCircle, item.completed && styles.checkCircleActive]}>
          <Text style={[styles.checkIcon, item.completed && styles.checkIconActive]}>{item.completed ? '✓' : ''}</Text>
        </Pressable>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.taskMeta}>{formatDueDate(item.dueDate)}</Text>
        </View>
        <Pressable onPress={() => removeTask(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>🗑️</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{greetingText()}</Text>
          <Text style={styles.headerTitle}>Taskly</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>S</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>Overview</Text>
            <Text style={styles.summaryTitle}>Today’s progress</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{progress}%</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{remaining}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completed.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {(['All', 'Today', 'Upcoming', 'Completed'] as const).map(tab => {
          const active = tab === activeTab;
          return (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabButton, active && styles.tabButtonActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.taskListWrapper}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyBody}>Tap the plus button to add your first task.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.taskListContent}
          />
        )}
      </View>

      <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <Text style={styles.addIcon}>＋</Text>
      </Pressable>

      {showAndroidPicker && Platform.OS === 'android' && DateTimePicker ? (
        <DateTimePicker value={new Date(pickerDate)} mode="date" display="calendar" onChange={onDateChange} />
      ) : null}

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add task</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
            <Pressable style={styles.dateRow} onPress={openDueDate}>
              <View>
                <Text style={styles.dateLabel}>Due date</Text>
                <Text style={styles.dateValue}>{selectedDueDate ? formatDueDate(selectedDueDate) : 'Select a date'}</Text>
              </View>
              <Text style={styles.dateAction}>Choose</Text>
            </Pressable>
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.primaryButton, !title.trim() && styles.buttonDisabled]} onPress={onAddTask} disabled={!title.trim()}>
                <Text style={styles.primaryButtonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select due date</Text>
            {DateTimePicker ? (
              <DateTimePicker
                value={new Date(pickerDate)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={(event: any, selected?: Date) => {
                  if (event?.type === 'dismissed') {
                    setShowDateModal(false);
                    return;
                  }
                  const nextDate = selected || new Date(pickerDate);
                  const iso = nextDate.toISOString().split('T')[0];
                  setPickerDate(iso);
                  if (Platform.OS === 'ios') {
                    setSelectedDueDate(iso);
                  }
                }}
              />
            ) : (
              <Text style={styles.fallbackText}>Date picker unavailable.</Text>
            )}
            {Platform.OS === 'ios' && (
              <View style={styles.modalActions}>
                <Pressable style={styles.secondaryButton} onPress={() => { setSelectedDueDate(undefined); setShowDateModal(false); }}>
                  <Text style={styles.secondaryButtonText}>Clear</Text>
                </Pressable>
                <Pressable style={styles.primaryButton} onPress={() => { setSelectedDueDate(pickerDate); setShowDateModal(false); }}>
                  <Text style={styles.primaryButtonText}>Apply</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef5ff',
  },
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#eef5ff',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 6,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4338ca',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: '#6366f1',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    fontSize: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  badge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  badgeText: {
    color: '#4338ca',
    fontWeight: '900',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 999,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4338ca',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8fbff',
    borderRadius: 20,
    padding: 16,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tabButtonActive: {
    backgroundColor: '#4338ca',
  },
  tabText: {
    color: '#475569',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  taskListWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  taskListContent: {
    paddingBottom: 120,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#f8fbff',
    borderLeftWidth: 4,
    borderLeftColor: '#60a5fa',
  },
  checkCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4338ca',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkCircleActive: {
    backgroundColor: '#4338ca',
  },
  checkIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4338ca',
  },
  checkIconActive: {
    color: '#ffffff',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  taskMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  deleteButton: {
    padding: 10,
  },
  deleteText: {
    fontSize: 18,
  },
  separator: {
    height: 14,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  emptyBody: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 220,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 28,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#4338ca',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338ca',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  addIcon: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#ffffff',
    padding: 22,
    minHeight: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalClose: {
    fontSize: 24,
    color: '#64748b',
  },
  input: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#f8fbff',
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  dateAction: {
    color: '#4338ca',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4338ca',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#4338ca',
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fallbackText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default App;