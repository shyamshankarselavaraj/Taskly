import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import type { Task } from '../types/Task';

type NotificationPanelProps = {
  visible: boolean;
  notifications: Task[];
  onDismiss: (taskId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
};

function timeLabel(task: Task): string {
  const today = new Date().toISOString().split('T')[0];
  if (!task.dueDate) return '';
  if (task.dueDate < today) return `Overdue · ${task.dueDate}`;
  return `Due today${task.dueTime ? ' · ' + task.dueTime : ''}`;
}

export function NotificationPanel({
  visible,
  notifications,
  onDismiss,
  onClearAll,
  onClose,
}: NotificationPanelProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.panel, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          {/* Header row */}
          <View style={[styles.panelHeader, { borderBottomColor: theme.border }]}>
            <View style={styles.panelTitleRow}>
              <Ionicons name="notifications" size={18} color={theme.accent} />
              <Text style={[styles.panelTitle, { color: theme.text }]}>
                Notifications
              </Text>
              {notifications.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.countBadgeText}>{notifications.length}</Text>
                </View>
              )}
            </View>
            {notifications.length > 0 && (
              <Pressable onPress={onClearAll} style={styles.clearAllBtn}>
                <Text style={[styles.clearAllText, { color: theme.accent }]}>
                  Clear all
                </Text>
              </Pressable>
            )}
          </View>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={40} color={theme.subText} />
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                You're all caught up!
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map(task => {
                const isOverdue =
                  task.dueDate && task.dueDate < new Date().toISOString().split('T')[0];
                return (
                  <View
                    key={task.id}
                    style={[
                      styles.item,
                      { borderBottomColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: isOverdue ? '#ef4444' : '#f97316' },
                      ]}
                    />
                    <View style={styles.itemContent}>
                      <Text
                        style={[styles.itemTitle, { color: theme.text }]}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                      <Text style={[styles.itemMeta, { color: isOverdue ? '#ef4444' : '#f97316' }]}>
                        {timeLabel(task)}
                      </Text>
                      {task.category ? (
                        <Text style={[styles.itemCategory, { color: theme.subText }]}>
                          {task.category}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => onDismiss(task.id)}
                      style={styles.dismissBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="close-circle" size={20} color={theme.subText} />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 16,
  },
  panel: {
    width: 320,
    maxHeight: 440,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  clearAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    maxHeight: 360,
  },
  listContent: {
    paddingBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  itemCategory: {
    fontSize: 11,
    marginTop: 2,
  },
  dismissBtn: {
    padding: 2,
  },
});
