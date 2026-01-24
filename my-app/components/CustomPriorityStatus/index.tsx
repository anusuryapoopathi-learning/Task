import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface PriorityStatusOption {
  label: string;
  value: string;
  color: string; // Color for the dot
}

export interface CustomPriorityStatusProps {
  label: string;
  options: PriorityStatusOption[];
  value: string;
  onValueChange: (value: string) => void;
  containerStyle?: ViewStyle;
  error?: string;
}

export const CustomPriorityStatus: React.FC<CustomPriorityStatusProps> = ({
  label,
  options,
  value,
  onValueChange,
  containerStyle,
  error,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                isSelected && styles.selectedButton,
                error && !isSelected && styles.errorButton,
              ]}
              onPress={() => onValueChange(option.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.dot, { backgroundColor: option.color }]} />
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedButton: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  errorButton: {
    borderColor: '#e74c3c',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
});
