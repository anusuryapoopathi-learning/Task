export type TaskDetailSectionType = 'title' | 'status' | 'description' | 'details';

export interface TaskDetailSection {
  type: TaskDetailSectionType;
  key: string;
}

export const TASK_DETAIL_SECTIONS: TaskDetailSection[] = [
  { type: 'title', key: 'title' },
  { type: 'status', key: 'status' },
  { type: 'description', key: 'description' },
  { type: 'details', key: 'details' },
];
