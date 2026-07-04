import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../theme/ThemeContext';
import type { Task } from '../types/Task';
import { todayIso } from '../utils/date';

export function CalendarScreen({ tasks }: { tasks: Task[] }) {
  const [selectedDate, setSelectedDate] = useState<string>(todayIso());
  const { theme } = useTheme();

  const markedDates = useMemo(() => {
    const result: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const existing = result[task.dueDate] ?? {};
      result[task.dueDate] = {
        ...existing,
        marked: true,
        dotColor: task.completed ? '#22c55e' : '#4338ca',
      };
    });
    result[selectedDate] = {
      ...(result[selectedDate] ?? {}),
      selected: true,
      selectedColor: '#4338ca',
    };
    return result;
  }, [tasks, selectedDate]);

  const selectedTasks = tasks.filter(task => task.dueDate === selectedDate);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
      <Calendar
        markedDates={markedDates}
        onDayPress={day => setSelectedDate(day.dateString)}
        theme={{
          calendarBackground: theme.card,
          dayTextColor: theme.text,
          monthTextColor: theme.text,
          arrowColor: theme.accent,
          selectedDayBackgroundColor: theme.accent,
          todayTextColor: theme.accent,
          dotColor: theme.accent,
          selectedDotColor: '#ffffff',
          textDisabledColor: theme.subText,
        }}
      />
      <View style={[styles.panel, { backgroundColor: theme.card }]}>
        <Text style={[styles.panelTitle, { color: theme.text }]}>
          {selectedDate === todayIso() ? "Today's tasks" : `Tasks for ${selectedDate}`}
        </Text>
        {selectedTasks.length === 0 ? (
          <Text style={styles.empty}>No tasks scheduled for this day.</Text>
        ) : (
          selectedTasks.map(task => (
            <View key={task.id} style={[styles.item, { borderBottomColor: theme.border }]}>
              <View style={[styles.dot, { backgroundColor: task.completed ? '#22c55e' : theme.accent }]} />
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: theme.text }, task.completed && styles.strikethrough]}>{task.title}</Text>
                {task.dueTime ? <Text style={[styles.itemMeta, { color: theme.subText }]}>{task.dueTime}</Text> : null}
                <Text style={[styles.itemBadge, { color: task.completed ? '#22c55e' : '#f97316' }]}>
                  {task.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef5ff' },
  content: { padding: 16, paddingBottom: 32 },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '800', marginBottom: 12 },
  panel: { marginTop: 12, backgroundColor: '#ffffff', borderRadius: 20, padding: 14 },
  panelTitle: { color: '#0f172a', fontWeight: '700', marginBottom: 10 },
  empty: { color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  itemContent: { flex: 1 },
  itemTitle: { color: '#0f172a', fontWeight: '700', fontSize: 15 },
  strikethrough: { textDecorationLine: 'line-through', color: '#94a3b8' },
  itemMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
  itemBadge: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});
