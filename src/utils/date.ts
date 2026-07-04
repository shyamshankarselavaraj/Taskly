export function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export function formatDueDate(date?: string) {
  if (!date) return 'No due date';
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDueTime(time?: string) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const parsed = new Date();
  parsed.setHours(hours, minutes, 0, 0);
  return parsed.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function greetingText() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getReminderLabel(reminder?: number) {
  switch (reminder) {
    case 5:
      return '5 minutes before';
    case 10:
      return '10 minutes before';
    case 30:
      return '30 minutes before';
    case 60:
      return '1 hour before';
    case 1440:
      return '1 day before';
    default:
      return 'None';
  }
}
