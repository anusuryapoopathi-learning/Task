import { delay } from './delay';
import type { Task } from '@/components/TaskCard';

// In-memory storage for tasks (simulating a database)
let tasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Finalize the Q1 project proposal with budget estimates and timeline',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date('2026-01-24'),
    category: 'Work',
    createdDate: new Date('2026-01-23'),
  },
  {
    id: '2',
    title: 'Interview Preparation',
    description: 'Review system design concepts and practice coding problems',
    status: 'Pending',
    priority: 'High',
    dueDate: new Date('2026-01-24'),
    category: 'Interview Preparation',
    createdDate: new Date('2026-01-22'),
  },
  {
    id: '3',
    title: 'Morning workout',
    description: '30 minutes cardio and strength training',
    status: 'Completed',
    priority: 'Medium',
    dueDate: new Date('2026-01-24'),
    category: 'Health & Fitness',
    createdDate: new Date('2026-01-20'),
  },
  {
    id: '4',
    title: 'Learn TypeScript generics',
    description: 'Study advanced TypeScript patterns and generic programming',
    status: 'Pending',
    priority: 'Medium',
    dueDate: new Date('2026-01-25'),
    category: 'Learning',
    createdDate: new Date('2026-01-21'),
  },
  {
    id: '5',
    title: 'Grocery shopping',
    description: 'Buy vegetables, fruits, and household items',
    status: 'Pending',
    priority: 'Low',
    dueDate: new Date('2026-01-26'),
    category: 'Personal',
    createdDate: new Date('2026-01-19'),
  },
  {
    id: '6',
    title: 'Team standup meeting',
    description: 'Daily team sync and progress update',
    status: 'Pending',
    priority: 'Medium',
    dueDate: new Date('2026-01-24'),
    category: 'Work',
    createdDate: new Date('2026-01-18'),
  },
];

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: Date;
  createdDate: Date;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  await delay(500);
  return [...tasks]; // Return a copy
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  await delay(300);
  const task = tasks.find((t) => t.id === id);
  return task ? { ...task } : null;
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskRequest): Promise<Task> {
  await delay(600);
  
  const newTask: Task = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: data.status,
    dueDate: data.dueDate,
    createdDate: data.createdDate,
  };

  tasks.push(newTask);
  return { ...newTask };
}

/**
 * Update an existing task
 */
export async function updateTask(data: UpdateTaskRequest): Promise<Task> {
  await delay(500);
  
  const taskIndex = tasks.findIndex((t) => t.id === data.id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    ...data,
    id: data.id, // Ensure ID doesn't change
  };

  tasks[taskIndex] = updatedTask;
  return { ...updatedTask };
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  await delay(400);
  
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  tasks.splice(taskIndex, 1);
}

/**
 * Mark task as complete
 */
export async function markTaskComplete(id: string): Promise<Task> {
  await delay(400);
  
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    status: 'Completed',
  };

  tasks[taskIndex] = updatedTask;
  return { ...updatedTask };
}
