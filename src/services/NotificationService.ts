import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import type { Task } from '../types/Task';

const CHANNEL_ID = 'taskly-reminders';

async function ensureChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Task Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function requestNotificationPermission() {
  await ensureChannel();
  await notifee.requestPermission();
}

export async function scheduleReminder(task: Task) {
  if (!task.reminder || task.completed || !task.dueDate) return;

  try {
    await ensureChannel();

    const [year, month, day] = task.dueDate.split('-').map(Number);
    const [hour = 9, minute = 0] = task.dueTime
      ? task.dueTime.split(':').map(Number)
      : [9, 0];

    const triggerTime = new Date(year, month - 1, day, hour, minute).getTime() - task.reminder * 60 * 1000;

    if (triggerTime <= Date.now()) return;

    await notifee.createTriggerNotification(
      {
        title: '⏰ Taskly Reminder',
        body: task.title,
        android: {
          channelId: CHANNEL_ID,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
        id: `task-${task.id}`,
      },
      { type: TriggerType.TIMESTAMP, timestamp: triggerTime },
    );
  } catch (e) {
    console.warn('Failed to schedule notification', e);
  }
}

export async function cancelReminder(taskId: string) {
  try {
    await notifee.cancelNotification(`task-${taskId}`);
  } catch (_) {}
}
