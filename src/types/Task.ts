export type TaskCategory = string;
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskReminder = 0 | -1 | 5 | 10 | 30 | 60 | 1440;

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  reminder?: TaskReminder;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  createdAt: number;
};

export type FilterTab = 'All' | 'Today' | 'Upcoming' | 'Completed';
