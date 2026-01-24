import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { SimpleDropdown, type SimpleDropdownProps, type DropdownOption } from '@/components/CustomDropDrown/SimpleDropdown';

export interface FormDropdownProps extends Omit<SimpleDropdownProps, 'value' | 'onSelect' | 'error'> {
  name: string;
}

export const FormDropdown: React.FC<FormDropdownProps> = ({ name, ...dropdownProps }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <SimpleDropdown
          {...dropdownProps}
          value={value}
          onSelect={(option: DropdownOption) => onChange(option.value)}
          error={errors[name]?.message as string | undefined}
        />
      )}
    />
  );
};
