import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DetailCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

export const DetailCard: React.FC<DetailCardProps> = ({ icon, label, value }) => {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={20} color="#6B7280" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
});
