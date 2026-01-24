import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CustomPriorityStatus, type CustomPriorityStatusProps } from '@/components/CustomPriorityStatus';

export interface FormPriorityStatusProps extends Omit<CustomPriorityStatusProps, 'value' | 'onValueChange' | 'error'> {
  name: string;
}

export const FormPriorityStatus: React.FC<FormPriorityStatusProps> = ({ name, ...priorityStatusProps }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <CustomPriorityStatus
          {...priorityStatusProps}
          value={value || ''}
          onValueChange={onChange}
          error={errors[name]?.message as string | undefined}
        />
      )}
    />
  );
};
