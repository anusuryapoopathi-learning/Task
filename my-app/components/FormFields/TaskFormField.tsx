import type { DropdownOption } from '@/components/CustomDropDrown/SimpleDropdown';
import type { PriorityStatusOption } from '@/components/CustomPriorityStatus';
import React from 'react';
import { FormDatePicker } from './FormDatePicker';
import { FormDropdown } from './FormDropdown';
import { FormInput } from './FormInput';
import { FormPriorityStatus } from './FormPriorityStatus';
import { FormReadOnly } from './FormReadOnly';
import { FormTextArea } from './FormTextArea';

export type TaskFormFieldType = 'title' | 'description' | 'category' | 'priority' | 'status' | 'dueDate' | 'createdDate';

export interface TaskFormFieldProps {
  type: TaskFormFieldType;
  name: string;
  // Title field props
  titleLabel?: string;
  titlePlaceholder?: string;
  // Description field props
  descriptionLabel?: string;
  descriptionPlaceholder?: string;
  // Category field props
  categoryLabel?: string;
  categoryPlaceholder?: string;
  categoryOptions?: DropdownOption[];
  // Priority field props
  priorityLabel?: string;
  priorityOptions?: PriorityStatusOption[];
  // Status field props
  statusLabel?: string;
  statusOptions?: PriorityStatusOption[];
  // Due Date field props
  dueDateLabel?: string;
  dueDatePlaceholder?: string;
  dueDateMinimumDate?: Date;
  // Created Date field props
  createdDateLabel?: string;
  createdDateFormatter?: (value: any) => string;
  // Common props
  containerStyle?: object;
}

export const TaskFormField: React.FC<TaskFormFieldProps> = ({
  type,
  name,
  titleLabel = 'Task Title',
  titlePlaceholder = 'Enter task title',
  descriptionLabel = 'Description',
  descriptionPlaceholder = 'Add notes or details',
  categoryLabel = 'Category',
  categoryPlaceholder = 'Select category',
  categoryOptions = [],
  priorityLabel = 'Priority',
  priorityOptions = [],
  statusLabel = 'Status',
  statusOptions = [],
  dueDateLabel = 'Due Date',
  dueDatePlaceholder = 'Select due date',
  dueDateMinimumDate,
  createdDateLabel = 'Created Date',
  createdDateFormatter,
  containerStyle,
}) => {
  switch (type) {
    case 'title':
      return (
        <FormInput
          name={name}
          label={titleLabel}
          placeholder={titlePlaceholder}
          containerStyle={containerStyle}
        />
      );

    case 'description':
      return (
        <FormTextArea
          name={name}
          label={descriptionLabel}
          placeholder={descriptionPlaceholder}
          containerStyle={containerStyle}
        />
      );

    case 'category':
      return (
        <FormDropdown
          name={name}
          label={categoryLabel}
          placeholder={categoryPlaceholder}
          options={categoryOptions}
          containerStyle={containerStyle}
        />
      );

    case 'priority':
      return (
        <FormPriorityStatus
          name={name}
          label={priorityLabel}
          options={priorityOptions}
          containerStyle={containerStyle}
        />
      );

    case 'status':
      return (
        <FormPriorityStatus
          name={name}
          label={statusLabel}
          options={statusOptions}
          containerStyle={containerStyle}
        />
      );

    case 'dueDate':
      return (
        <FormDatePicker
          name={name}
          label={dueDateLabel}
          placeholder={dueDatePlaceholder}
          mode="date"
          minimumDate={dueDateMinimumDate}
          containerStyle={containerStyle}
        />
      );

    case 'createdDate':
      return (
        <FormReadOnly
          name={name}
          label={createdDateLabel}
          formatValue={createdDateFormatter}
          containerStyle={containerStyle}
        />
      );

    default:
      return null;
  }
};
