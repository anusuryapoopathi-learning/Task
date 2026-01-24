import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface SegmentedButtonOption {
  label: string;
  value: string | number;
}

export interface CustomSegmentedButtonsProps {
  options: SegmentedButtonOption[];
  value: string | number;
  onValueChange: (value: string | number) => void;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  selectedButtonStyle?: ViewStyle;
  textStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
}

export const CustomSegmentedButtons: React.FC<CustomSegmentedButtonsProps> = ({
  options,
  value,
  onValueChange,
  containerStyle,
  buttonStyle,
  selectedButtonStyle,
  textStyle,
  selectedTextStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              isFirst && styles.firstButton,
              isLast && styles.lastButton,
              !isFirst && !isLast && styles.middleButton,
              isSelected && styles.selectedButton,
              buttonStyle,
              isSelected && selectedButtonStyle,
            ]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                isSelected && styles.selectedText,
                textStyle,
                isSelected && selectedTextStyle,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  firstButton: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  lastButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  middleButton: {
    borderRadius: 0,
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
