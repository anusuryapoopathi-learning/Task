import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';

export interface FormTextAreaProps {
  name: string;
  label?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
  numberOfLines?: number;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  name,
  label,
  placeholder = 'Add notes or details',
  containerStyle,
  labelStyle,
  disabled = false,
  numberOfLines = 6,
}) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={[styles.container, containerStyle]}>
          {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
          <TextInput
            style={[
              styles.textArea,
              errors[name] && styles.inputError,
              disabled && styles.disabled,
            ]}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={value || ''}
            onChangeText={onChange}
            multiline
            numberOfLines={numberOfLines}
            textAlignVertical="top"
            editable={!disabled}
          />
          {errors[name] && (
            <Text style={styles.errorText}>{errors[name]?.message as string}</Text>
          )}
        </View>
      )}
    />
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
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    color: '#333',
    minHeight: 120,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
});
