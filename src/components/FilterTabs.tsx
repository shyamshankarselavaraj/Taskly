import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FilterTab } from '../types/Task';

type FilterTabsProps = {
  activeTab: FilterTab;
  onChange: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
};

const tabs: FilterTab[] = ['All', 'Today', 'Upcoming', 'Completed'];

export function FilterTabs({ activeTab, onChange, counts }: FilterTabsProps) {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = tab === activeTab;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab}</Text>
            <Text style={[styles.count, isActive && styles.countActive]}>{counts[tab]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabActive: {
    backgroundColor: '#4338ca',
    borderColor: '#4338ca',
  },
  label: {
    color: '#475569',
    fontWeight: '700',
    marginRight: 6,
  },
  labelActive: {
    color: '#ffffff',
  },
  count: {
    color: '#64748b',
    fontWeight: '700',
  },
  countActive: {
    color: '#ffffff',
  },
});
