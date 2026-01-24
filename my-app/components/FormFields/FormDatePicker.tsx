import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CustomDatePicker, type CustomDatePickerProps } from '@/components/CustomDatePicker';

export interface FormDatePickerProps extends Omit<CustomDatePickerProps, 'value' | 'onDateChange' | 'error'> {
  name: string;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({ name, ...datePickerProps }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <CustomDatePicker
          {...datePickerProps}
          value={value instanceof Date ? value : value ? new Date(value) : undefined}
          onDateChange={onChange}
          error={errors[name]?.message as string | undefined}
        />
      )}
    />
  );
};
