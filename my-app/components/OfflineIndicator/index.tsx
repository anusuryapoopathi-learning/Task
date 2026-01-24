import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OfflineIndicatorProps {
  visible: boolean;
  pendingCount?: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  visible,
  pendingCount = 0,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Ionicons name="cloud-offline-outline" size={18} color="#fff" />
      <Text style={styles.text}>
        {pendingCount > 0
          ? `Offline - ${pendingCount} action${pendingCount > 1 ? 's' : ''} pending`
          : 'You are offline'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 10000,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
