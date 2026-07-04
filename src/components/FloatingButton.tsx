import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

type FloatingButtonProps = {
  onPress: () => void;
};

export function FloatingButton({ onPress }: FloatingButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient colors={['#4338ca', '#7c3aed']} style={styles.button}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
});
