import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .min(3, 'Task title must be at least 3 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters'),
  category: z
    .string()
    .min(1, 'Category is required'),
  priority: z
    .enum(['Low', 'Medium', 'High'], {
      errorMap: () => ({ message: 'Priority is required' }),
    }),
  status: z
    .enum(['Pending', 'In Progress', 'Completed'], {
      errorMap: () => ({ message: 'Status is required' }),
    }),
  dueDate: z
    .date({
      required_error: 'Due date is required',
    }),
  createdDate: z.date().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
