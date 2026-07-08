import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { loadCustomCategories, saveCustomCategories } from '../storage/Storage';
import type { Task, TaskCategory, TaskPriority, TaskReminder } from '../types/Task';
import { todayIso } from '../utils/date';

type AddTaskModalProps = {
  visible: boolean;
  initialTask?: Task | null;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
};

const categories: TaskCategory[] = ['Work', 'Learning', 'Shopping', 'Health', 'Personal'];
const priorities: TaskPriority[] = ['High', 'Medium', 'Low'];
const reminders: Array<{ value: TaskReminder; label: string }> = [
  { value: 0, label: 'None' },
  { value: -1, label: 'At due time' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

function getCategoryColor(category: string) {
  if (category === 'Work') return '#7c3aed';
  if (category === 'Learning') return '#16a34a';
  if (category === 'Personal') return '#2563eb';
  if (category === 'Shopping') return '#f59e0b';
  if (category === 'Health') return '#ef4444';

  let hash = 0;
  for (let index = 0; index < category.length; index += 1) {
    hash = category.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

export function AddTaskModal({ visible, initialTask, onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [dueTime, setDueTime] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [reminder, setReminder] = useState<TaskReminder>(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderOptions, setShowReminderOptions] = useState(false);

  useEffect(() => {
    loadCustomCategories().then(stored => setCustomCategories(stored));
  }, []);

  useEffect(() => {
    if (visible && initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime);
      setCategory(initialTask.category);

      if (!categories.includes(initialTask.category)) {
        setCustomCategories(current => {
          if (current.some(item => item.toLowerCase() === initialTask.category.toLowerCase())) {
            return current;
          }

          const next = [...current, initialTask.category];
          saveCustomCategories(next);
          return next;
        });
      }

      setPriority(initialTask.priority);
      setReminder(initialTask.reminder ?? 0);
    } else if (!visible) {
      reset();
    }
  }, [visible, initialTask]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);
  const canSelectTime = Boolean(dueDate);
  const canSelectReminder = Boolean(dueDate && dueTime);
  const selectedReminderLabel = useMemo(() => {
    return reminders.find(item => item.value === reminder)?.label ?? 'None';
  }, [reminder]);
  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();

    [...categories, ...customCategories].forEach(item => {
      const normalized = item.trim();
      if (normalized.length === 0) {
        return;
      }

      const key = normalized.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, normalized);
      }
    });

    const current = category.trim();
    if (current.length > 0) {
      const key = current.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, current);
      }
    }

    return Array.from(seen.values());
  }, [category, customCategories]);

  const addCustomCategory = () => {
    const nextCategory = customCategoryInput.trim();
    if (nextCategory.length === 0) {
      return;
    }

    setCategory(nextCategory);
    setCustomCategories(current => {
      if (current.some(item => item.toLowerCase() === nextCategory.toLowerCase())) {
        return current;
      }

      const next = [...current, nextCategory];
      saveCustomCategories(next);
      return next;
    });
    setCustomCategoryInput('');
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueDate ? dueTime : undefined,
      reminder: dueDate && dueTime ? reminder : 0,
      category,
      priority,
    });
    reset();
    onClose();
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setDueTime(undefined);
    setCategory('Work');
    setCustomCategoryInput('');
    setShowReminderOptions(false);
    setPriority('Medium');
    setReminder(0);
  };

  useEffect(() => {
    if (!canSelectReminder) {
      setReminder(0);
      setShowReminderOptions(false);
    }
  }, [canSelectReminder]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add task</Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <Pressable style={styles.select} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.label}>Due date</Text>
                <Text style={styles.value}>{dueDate ?? 'Select date'}</Text>
              </Pressable>
              <View style={[styles.select, !canSelectReminder && styles.disabledSelect]}>
                <Text style={styles.label}>Reminder</Text>
                <Pressable
                  style={styles.dropdownTrigger}
                  onPress={() => {
                    if (!canSelectReminder) {
                      return;
                    }
                    setShowReminderOptions(current => !current);
                  }}
                  disabled={!canSelectReminder}
                >
                  <Text style={styles.value}>{selectedReminderLabel}</Text>
                  <Ionicons name={showReminderOptions ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
                </Pressable>
                {showReminderOptions ? (
                  <View style={styles.dropdownList}>
                    {reminders.map(item => {
                      const selected = reminder === item.value;
                      return (
                        <Pressable
                          key={item.label}
                          onPress={() => {
                            setReminder(item.value);
                            setShowReminderOptions(false);
                          }}
                          style={[styles.dropdownOption, selected && styles.dropdownOptionSelected]}
                        >
                          <Text style={[styles.optionText, selected && styles.dropdownOptionTextSelected]}>{item.label}</Text>
                          {selected ? <Ionicons name="checkmark" size={16} color="#4338ca" /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            </View>

            <Pressable
              style={[styles.select, styles.timeSelect, !canSelectTime && styles.disabledSelect]}
              onPress={() => {
                if (!canSelectTime) {
                  return;
                }
                setShowTimePicker(true);
              }}
              disabled={!canSelectTime}
            >
              <Text style={styles.label}>Due time</Text>
              <Text style={[styles.value, !canSelectTime && styles.disabledValue]}>{dueTime ?? 'Select time'}</Text>
            </Pressable>

              <View style={styles.row}>
              <View style={styles.selectGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.customCategoryRow}>
                  <TextInput
                    style={styles.customCategoryInput}
                    placeholder="Add custom category"
                    value={customCategoryInput}
                    onChangeText={setCustomCategoryInput}
                    onSubmitEditing={addCustomCategory}
                    returnKeyType="done"
                  />
                  <Pressable
                    onPress={addCustomCategory}
                    style={[styles.addCategoryButton, customCategoryInput.trim().length === 0 && styles.disabled]}
                    disabled={customCategoryInput.trim().length === 0}
                  >
                    <Text style={styles.addCategoryText}>Add</Text>
                  </Pressable>
                </View>
                {categoryOptions.map(item => {
                  const color = getCategoryColor(item);
                  const selected = category === item;
                  return (
                    <Pressable key={item} onPress={() => setCategory(item)} style={[styles.optionRow, selected && { backgroundColor: `${color}18`, borderRadius: 10 }]}>
                      <View style={[styles.optionDot, { backgroundColor: color }]} />
                      <Text style={[styles.optionText, selected && { color, fontWeight: '700' }]}>{item}</Text>
                      {selected ? <Ionicons name="checkmark-circle" size={15} color={color} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.selectGroup}>
                <Text style={styles.label}>Priority</Text>
                {priorities.map(item => {
                  const color = item === 'High' ? '#ef4444' : item === 'Medium' ? '#f97316' : '#22c55e';
                  const selected = priority === item;
                  return (
                    <Pressable key={item} onPress={() => setPriority(item)} style={[styles.optionRow, selected && { backgroundColor: `${color}18`, borderRadius: 10 }]}>
                      <View style={[styles.optionDot, { backgroundColor: color }]} />
                      <Text style={[styles.optionText, selected && { color, fontWeight: '700' }]}>{item}</Text>
                      {selected ? <Ionicons name="checkmark-circle" size={15} color={color} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={handleClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.primaryButton, !canSave && styles.disabled]} onPress={handleSave} disabled={!canSave}>
              <Text style={styles.primaryText}>Save Task</Text>
            </Pressable>
          </View>

          {showDatePicker ? (
            <DateTimePicker
              value={dueDate ? new Date(`${dueDate}T12:00:00`) : new Date(todayIso())}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate.toISOString().split('T')[0]);
                } else {
                  setDueDate(undefined);
                  setDueTime(undefined);
                }
              }}
            />
          ) : null}
          {showTimePicker ? (
            <DateTimePicker
              value={dueTime ? new Date(`1970-01-01T${dueTime}:00`) : new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) {
                  const hours = String(selectedDate.getHours()).padStart(2, '0');
                  const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
                  setDueTime(`${hours}:${minutes}`);
                }
              }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  customCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  customCategoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  addCategoryButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#4338ca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  select: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeSelect: {
    marginBottom: 12,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownOptionSelected: {
    backgroundColor: '#eef2ff',
  },
  dropdownOptionTextSelected: {
    color: '#4338ca',
    fontWeight: '700',
  },
  disabledSelect: {
    opacity: 0.55,
  },
  selectGroup: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  value: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledValue: {
    color: '#94a3b8',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  optionText: {
    color: '#0f172a',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#eef2ff',
  },
  secondaryText: {
    color: '#4338ca',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4338ca',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
