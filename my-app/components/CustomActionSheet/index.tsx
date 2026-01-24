import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ActionSheetOption {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

export interface CustomActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
  cancelText?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

export const CustomActionSheet: React.FC<CustomActionSheetProps> = ({
  visible,
  onClose,
  title,
  options,
  cancelText = 'Cancel',
  containerStyle,
  titleStyle,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.container, containerStyle]}>
          {title && (
            <View style={styles.titleContainer}>
              <Text style={[styles.title, titleStyle]}>{title}</Text>
            </View>
          )}
          
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  index === 0 && styles.firstOption,
                  index === options.length - 1 && styles.lastOption,
                  option.destructive && styles.destructiveOption,
                ]}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
              >
                {option.icon && (
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={option.destructive ? '#e74c3c' : '#333'}
                    style={styles.optionIcon}
                  />
                )}
                <Text
                  style={[
                    styles.optionText,
                    option.destructive && styles.destructiveText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  firstOption: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  destructiveOption: {
    // Additional styles for destructive actions
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  destructiveText: {
    color: '#e74c3c',
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
