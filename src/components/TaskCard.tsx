import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Task } from '../types/Task';
import { formatDueDate, formatDueTime } from '../utils/date';

const categoryColors: Record<string, string> = {
  Work: '#7c3aed',
  Learning: '#16a34a',
  Personal: '#2563eb',
  Shopping: '#f59e0b',
  Health: '#ef4444',
};

function getCategoryColor(category: string) {
  const predefined = categoryColors[category];
  if (predefined) {
    return predefined;
  }

  let hash = 0;
  for (let index = 0; index < category.length; index += 1) {
    hash = category.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

const priorityColors: Record<Task['priority'], string> = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#22c55e',
};

type TaskCardProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (task: Task) => void;
};

export function TaskCard({ task, onToggle, onDelete, onPress }: TaskCardProps) {
  const categoryColor = getCategoryColor(task.category);

  return (
    <Pressable onPress={() => onPress?.(task)} style={styles.card}>
      <View style={[styles.priorityStrip, { backgroundColor: priorityColors[task.priority] }]} />
      <Pressable style={[styles.check, task.completed && styles.checkActive]} onPress={() => onToggle(task.id)}>
        {task.completed ? <Ionicons name="checkmark" size={16} color="#ffffff" /> : null}
      </Pressable>
      <View style={styles.body}>
        <Text style={[styles.title, task.completed && styles.titleCompleted]}>{task.title}</Text>
        {task.description ? <Text style={styles.description} numberOfLines={2}>{task.description}</Text> : null}
        <View style={styles.badgesRow}>
          {task.dueDate ? (
            <View style={styles.badge}>
              <Ionicons name="calendar-outline" size={12} color="#64748b" />
              <Text style={styles.badgeText}>{formatDueDate(task.dueDate)}</Text>
            </View>
          ) : null}
          {task.dueTime ? (
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={12} color="#64748b" />
              <Text style={styles.badgeText}>{formatDueTime(task.dueTime)}</Text>
            </View>
          ) : null}
          <View style={[styles.badge, styles.categoryBadge, { borderColor: categoryColor }]}> 
            <Text style={[styles.badgeText, { color: categoryColor }]}>{task.category}</Text>
          </View>
        </View>
      </View>
      <Pressable onPress={() => onDelete(task.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={18} color="#64748b" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  priorityStrip: {
    width: 4,
    borderRadius: 999,
    backgroundColor: '#4338ca',
    marginRight: 10,
    alignSelf: 'stretch',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkActive: {
    backgroundColor: '#4338ca',
    borderColor: '#4338ca',
  },
  body: {
    flex: 1,
  },
  title: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  description: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  categoryBadge: {
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  badgeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
  },
});
