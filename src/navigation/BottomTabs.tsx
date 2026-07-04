import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../theme/ThemeContext';
import type { Task, FilterTab } from '../types/Task';

const Tab = createBottomTabNavigator();

type BottomTabsProps = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleComplete: (id: string) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  counts: Record<FilterTab, number>;
  userName: string;
  setUserName: (name: string) => void;
  notificationCount: number;
};

export function BottomTabs(props: BottomTabsProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Home' ? 'home-outline' : route.name === 'Calendar' ? 'calendar-outline' : route.name === 'Analytics' ? 'bar-chart-outline' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.subText,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopWidth: 0,
          backgroundColor: theme.tabBar,
        },
      })}
    >
      <Tab.Screen name="Home">
        {() => <HomeScreen {...props} activeTab={activeTab} setActiveTab={setActiveTab} />}
      </Tab.Screen>
      <Tab.Screen name="Calendar">
        {() => <CalendarScreen tasks={props.tasks} />}
      </Tab.Screen>
      <Tab.Screen name="Analytics">
        {() => <AnalyticsScreen tasks={props.tasks} />}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {() => <SettingsScreen tasks={props.tasks} clearCompleted={props.clearCompleted} userName={props.userName} onNameChange={props.setUserName} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
