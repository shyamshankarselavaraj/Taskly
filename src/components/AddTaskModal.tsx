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
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

export function AddTaskModal({ visible, initialTask, onClose, onSave }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [dueTime, setDueTime] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [reminder, setReminder] = useState<TaskReminder>(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible && initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
      setDueDate(initialTask.dueDate);
      setDueTime(initialTask.dueTime);
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setReminder(initialTask.reminder ?? 0);
    } else if (!visible) {
      reset();
    }
  }, [visible, initialTask]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime,
      reminder,
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
    setPriority('Medium');
    setReminder(0);
  };

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
              <Pressable style={styles.select} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.label}>Due time</Text>
                <Text style={styles.value}>{dueTime ?? 'Select time'}</Text>
              </Pressable>
            </View>

              <View style={styles.row}>
              <View style={styles.selectGroup}>
                <Text style={styles.label}>Category</Text>
                {categories.map(item => {
                  const color = item === 'Work' ? '#7c3aed' : item === 'Learning' ? '#16a34a' : item === 'Personal' ? '#2563eb' : item === 'Shopping' ? '#f59e0b' : '#ef4444';
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

            <View style={styles.selectGroup}>
              <Text style={styles.label}>Reminder</Text>
              {reminders.map(item => (
                <Pressable key={item.label} onPress={() => setReminder(item.value)} style={styles.optionRow}>
                  <Text style={styles.optionText}>{item.label}</Text>
                  {reminder === item.value ? <Ionicons name="checkmark" size={16} color="#4338ca" /> : null}
                </Pressable>
              ))}
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
