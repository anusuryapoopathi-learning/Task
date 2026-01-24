import type { PriorityStatusOption } from '@/components/CustomPriorityStatus';
import type { DropdownOption } from '@/components/CustomDropDrown/SimpleDropdown';

export const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Interview Preparation', value: 'interview' },
  { label: 'Health & Fitness', value: 'health' },
  { label: 'Learning', value: 'learning' },
];

export const PRIORITY_OPTIONS: PriorityStatusOption[] = [
  { label: 'Low', value: 'Low', color: '#10B981' },
  { label: 'Medium', value: 'Medium', color: '#F59E0B' },
  { label: 'High', value: 'High', color: '#EF4444' },
];

export const STATUS_OPTIONS: PriorityStatusOption[] = [
  { label: 'Pending', value: 'Pending', color: '#6B7280' },
  { label: 'In Progress', value: 'In Progress', color: '#3B82F6' },
  { label: 'Completed', value: 'Completed', color: '#10B981' },
];

// Category mapping for API (form value -> display name)
export const CATEGORY_MAP_TO_DISPLAY: Record<string, string> = {
  'work': 'Work',
  'personal': 'Personal',
  'interview': 'Interview Preparation',
  'health': 'Health & Fitness',
  'learning': 'Learning',
};

// Category mapping for form (display name -> form value)
export const CATEGORY_MAP_TO_FORM: Record<string, string> = {
  'Work': 'work',
  'Personal': 'personal',
  'Interview Preparation': 'interview',
  'Health & Fitness': 'health',
  'Learning': 'learning',
};

// Reverse mapping (form value -> display name) for edit task
export const CATEGORY_MAP_REVERSE: Record<string, string> = {
  'work': 'Work',
  'personal': 'Personal',
  'interview': 'Interview Preparation',
  'health': 'Health & Fitness',
  'learning': 'Learning',
};
