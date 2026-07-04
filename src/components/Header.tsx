import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { greetingText } from '../utils/date';
import { useTheme } from '../theme/ThemeContext';

type HeaderProps = {
  name?: string;
  notificationCount?: number;
};

export function Header({ name = 'User', notificationCount = 0 }: HeaderProps) {
  const { theme } = useTheme();
  const avatarLetter = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.greeting, { color: theme.subText }]}>{greetingText()}</Text>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.iconButton, { backgroundColor: theme.card }]}>
          <Ionicons name="notifications-outline" size={20} color={theme.accent} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
            </View>
          )}
        </Pressable>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
      </View>
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

