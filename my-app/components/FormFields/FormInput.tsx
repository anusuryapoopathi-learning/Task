import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CustomInput, type CustomInputProps } from '@/components/CustomInput';

export interface FormInputProps extends Omit<CustomInputProps, 'value' | 'onChangeText' | 'error'> {
  name: string;
}

export const FormInput: React.FC<FormInputProps> = ({ name, ...inputProps }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <CustomInput
          {...inputProps}
          value={value || ''}
          onChangeText={onChange}
          error={errors[name]?.message as string | undefined}
        />
      )}
    />
  );
};
