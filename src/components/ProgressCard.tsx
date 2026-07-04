import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import LinearGradient from 'react-native-linear-gradient';

type ProgressCardProps = {
  completed: number;
  total: number;
  remaining: number;
};

export function ProgressCard({ completed, total, remaining }: ProgressCardProps) {
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <LinearGradient colors={['#4338ca', '#6d28d9']} style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.label}>Today's Progress</Text>
        <Text style={styles.subtitle}>Keep going — you're almost there.</Text>
        <View style={styles.row}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.percent}>{progress}%</Text>
        </View>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statNumber}>{remaining}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View>
            <Text style={styles.statNumber}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>
      <AnimatedCircularProgress
        size={84}
        width={8}
        fill={progress}
        tintColor="#ffffff"
        backgroundColor="rgba(255,255,255,0.22)"
        rotation={0}
        lineCap="round"
      >
        {() => <Text style={styles.circleText}>{progress}%</Text>}
      </AnimatedCircularProgress>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: '#e0e7ff',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 10,
  },
  barFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 999,
  },
  percent: {
    color: '#ffffff',
    fontWeight: '800',
    minWidth: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
  },
  circleText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
});
