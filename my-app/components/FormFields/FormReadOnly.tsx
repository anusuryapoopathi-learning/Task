import React from 'react';
import { useFormContext } from 'react-hook-form';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface FormReadOnlyProps {
  name: string;
  label?: string;
  formatValue?: (value: any) => string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export const FormReadOnly: React.FC<FormReadOnlyProps> = ({
  name,
  label,
  formatValue,
  containerStyle,
  labelStyle,
}) => {
  const { watch } = useFormContext();
  const value = watch(name);

  const displayValue = formatValue ? formatValue(value) : (value?.toString() || '');

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.readOnlyInput}>
        <Text style={styles.readOnlyText}>{displayValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
