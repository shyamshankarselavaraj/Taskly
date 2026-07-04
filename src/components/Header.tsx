import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { greetingText } from '../utils/date';
import { useTheme } from '../theme/ThemeContext';
import { NotificationPanel } from './NotificationPanel';
import type { Task } from '../types/Task';

type HeaderProps = {
  name?: string;
  notificationCount?: number;
  notificationTasks?: Task[];
};

export function Header({ name = 'User', notificationCount = 0, notificationTasks = [] }: HeaderProps) {
  const { theme } = useTheme();
  const avatarLetter = name.trim().charAt(0).toUpperCase() || 'U';
  const [panelVisible, setPanelVisible] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleNotifications = notificationTasks.filter(t => !dismissedIds.has(t.id));
  const visibleCount = visibleNotifications.length;

  const handleDismiss = (taskId: string) => {
    setDismissedIds(prev => new Set([...prev, taskId]));
  };

  const handleClearAll = () => {
    setDismissedIds(new Set(notificationTasks.map(t => t.id)));
    setPanelVisible(false);
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.greeting, { color: theme.subText }]}>{greetingText()}</Text>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.iconButton, { backgroundColor: theme.card }]}
          onPress={() => setPanelVisible(true)}
        >
          <Ionicons name="notifications-outline" size={20} color={theme.accent} />
          {visibleCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{visibleCount > 99 ? '99+' : visibleCount}</Text>
            </View>
          )}
        </Pressable>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
      </View>

      <NotificationPanel
        visible={panelVisible}
        notifications={visibleNotifications}
        onDismiss={handleDismiss}
        onClearAll={handleClearAll}
        onClose={() => setPanelVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 14, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16,
    borderRadius: 8, backgroundColor: '#ef4444', justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  avatar: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});


