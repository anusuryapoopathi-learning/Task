import type { TaskFormFieldType } from '@/components/FormFields';
import type { CreateTaskInput } from '@/zod/TastCreateZod/createTask';

export interface TaskFormFieldConfig {
  type: TaskFormFieldType;
  key: keyof CreateTaskInput;
}

export const TASK_FORM_FIELDS: TaskFormFieldConfig[] = [
  { type: 'title', key: 'title' },
  { type: 'description', key: 'description' },
  { type: 'category', key: 'category' },
  { type: 'priority', key: 'priority' },
  { type: 'status', key: 'status' },
  { type: 'dueDate', key: 'dueDate' },
  { type: 'createdDate', key: 'createdDate' },
];
