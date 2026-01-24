import { CustomButton } from '@/components/CustomButton';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export interface TaskFormFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitTitle: string;
  cancelTitle?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  containerStyle?: ViewStyle;
  bottomInset?: number;
}

export const TaskFormFooter: React.FC<TaskFormFooterProps> = ({
  onCancel,
  onSubmit,
  submitTitle,
  cancelTitle = 'Cancel',
  isLoading = false,
  isDisabled = false,
  containerStyle,
  bottomInset = 0,
}) => {
  return (
    <View style={[styles.footer, containerStyle, { paddingBottom: bottomInset }]}>
      <View style={styles.buttonContainer}>
        <CustomButton
          title={cancelTitle}
          onPress={onCancel}
          variant="outline"
          size="large"
          containerStyle={styles.cancelButton}
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          title={submitTitle}
          onPress={onSubmit}
          variant="gradient"
          size="large"
          containerStyle={styles.submitButton}
          loading={isLoading}
          disabled={isDisabled || isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flex: 1,
  },
  cancelButton: {
    width: '100%',
  },
  submitButton: {
    width: '100%',
  },
});
