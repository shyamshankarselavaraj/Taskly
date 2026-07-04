import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../theme/ThemeContext';
import type { Task } from '../types/Task';

const SCREEN_WIDTH = Dimensions.get('window').width - 32;

const CATEGORY_COLORS: Record<string, string> = {
  Work: '#7c3aed',
  Learning: '#16a34a',
  Personal: '#2563eb',
  Shopping: '#f59e0b',
  Health: '#ef4444',
};

export function AnalyticsScreen({ tasks }: { tasks: Task[] }) {
  const { theme } = useTheme();
  const completed = tasks.filter(task => task.completed).length;
  const remaining = tasks.length - completed;
  const overdue = tasks.filter(task => task.dueDate && task.dueDate < new Date().toISOString().split('T')[0] && !task.completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  const categoryData = Object.entries(CATEGORY_COLORS).map(([category, color]) => ({
    name: category,
    population: tasks.filter(task => task.category === category).length,
    color,
    legendFontColor: '#64748b',
    legendFontSize: 12,
  }));
  const pieData = categoryData.filter(item => item.population > 0);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>

      <View style={styles.statsRow}>
        {[
          { label: 'Completion', value: `${progress}%`, color: '#4338ca' },
          { label: 'Total', value: `${tasks.length}`, color: '#0f172a' },
          { label: 'Completed', value: `${completed}`, color: '#16a34a' },
          { label: 'Remaining', value: `${remaining}`, color: '#f97316' },
          { label: 'Overdue', value: `${overdue}`, color: '#ef4444' },
        ].map(item => (
          <View key={item.label} style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Weekly trend</Text>
        <BarChart
          data={{ labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: [2, 3, 1, 4, 2, 3, 5] }] }}
          width={SCREEN_WIDTH - 24}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{ backgroundColor: theme.card, backgroundGradientFrom: theme.card, backgroundGradientTo: theme.card, color: () => theme.accent, decimalPlaces: 0 }}
          style={{ borderRadius: 16 }}
        />
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Category breakdown</Text>
        {pieData.length === 0 ? (
          <Text style={styles.empty}>No tasks with categories yet.</Text>
        ) : (
          <PieChart
            data={pieData}
            width={SCREEN_WIDTH - 24}
            height={200}
            chartConfig={{ color: () => '#4338ca' }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        )}
      </View>

      <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Category details</Text>
        {categoryData.map(item => (
          <View key={item.name} style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
            <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
            <Text style={styles.categoryCount}>{item.population} task{item.population !== 1 ? 's' : ''}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef5ff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  chartTitle: {
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 8,
  },
  empty: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    color: '#0f172a',
    fontWeight: '600',
  },
  categoryCount: {
    color: '#64748b',
    fontSize: 13,
  },
});
