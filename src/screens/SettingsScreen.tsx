import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { Task } from '../types/Task';

type SettingsScreenProps = {
  tasks: Task[];
  clearCompleted: () => void;
  userName: string;
  onNameChange: (name: string) => void;
};

export function SettingsScreen({ tasks, clearCompleted, userName, onNameChange }: SettingsScreenProps) {
  const { theme, darkMode, setDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length === 0) { setNameInput(userName); }
    else { onNameChange(trimmed); }
    setEditingName(false);
  };

  const handleClearCompleted = () => {
    Alert.alert('Clear completed tasks', 'This will permanently remove all completed tasks.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCompleted },
    ]);
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>Display name</Text>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={[styles.nameInput, { borderColor: theme.accent, color: theme.text, backgroundColor: theme.inputBg }]}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <Pressable style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSaveName}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => { setNameInput(userName); setEditingName(true); }}>
              <Text style={[styles.nameValue, { color: theme.accent }]}>{userName} <Text style={[styles.editHint, { color: theme.subText }]}>Edit</Text></Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>Dark mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#ffffff"
          />
        </View>
        <View style={[styles.row, styles.noBorder]}>
          <Text style={[styles.label, { color: theme.text }]}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks</Text>
        <Pressable style={[styles.button, { backgroundColor: theme.isDark ? '#3f0f0f' : '#fff1f2' }]} onPress={handleClearCompleted}>
          <Text style={styles.buttonTextDanger}>Clear completed tasks</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        <Text style={[styles.about, { color: theme.subText }]}>Taskly — your personal productivity companion.</Text>
        <Text style={[styles.about, { color: theme.subText }]}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} saved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#eef5ff' },
  content: { padding: 16, paddingBottom: 32 },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 14, marginBottom: 12 },
  sectionTitle: { color: '#0f172a', fontWeight: '700', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  noBorder: { borderBottomWidth: 0 },
  label: { color: '#0f172a', fontWeight: '600' },
  nameValue: { color: '#4338ca', fontWeight: '600' },
  editHint: { color: '#94a3b8', fontSize: 12, fontWeight: '400' },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    color: '#0f172a',
    minWidth: 120,
  },
  saveBtn: { backgroundColor: '#4338ca', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  button: {
    backgroundColor: '#fff1f2',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  buttonTextDanger: { color: '#ef4444', fontWeight: '700' },
  about: { color: '#64748b', marginBottom: 4 },
});
