import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomTabs } from './src/navigation/BottomTabs';
import { useTasks } from './src/hooks/useTasks';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppShell() {
  const { tasks, addTask, updateTask, toggleComplete, removeTask, clearCompleted, counts, userName, setUserName, notificationCount, notificationTasks } = useTasks();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <NavigationContainer>
        <BottomTabs
          tasks={tasks}
          addTask={addTask}
          updateTask={updateTask}
          toggleComplete={toggleComplete}
          removeTask={removeTask}
          clearCompleted={clearCompleted}
          counts={counts}
          userName={userName}
          setUserName={setUserName}
          notificationCount={notificationCount}
          notificationTasks={notificationTasks}
        />
      </NavigationContainer>
    </SafeAreaView>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
});

export default App;
