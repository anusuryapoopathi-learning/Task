import type { Task } from '@/components/TaskCard';
import { asyncStorage } from '@/lib/storage';
import { delay } from './delay';

const TASKS_STORAGE_KEY = '@tasks_storage';

// Initial tasks data
const initialTasks: Task[] = [
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

// In-memory storage for tasks (simulating a database)
let tasks: Task[] = [];

/**
 * Load tasks from AsyncStorage or use initial data
 */
async function loadTasks(): Promise<Task[]> {
  try {
    const stored = await asyncStorage.getItem<Task[]>(TASKS_STORAGE_KEY);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      // Convert date strings back to Date objects
      return stored.map((task) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdDate: task.createdDate ? new Date(task.createdDate) : undefined,
      }));
    }
    return initialTasks;
  } catch (error) {
    console.error('Error loading tasks from storage:', error);
    return initialTasks;
  }
}

/**
 * Save tasks to AsyncStorage
 */
async function saveTasks(tasksToSave: Task[]): Promise<void> {
  try {
    await asyncStorage.setItem(TASKS_STORAGE_KEY, tasksToSave);
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
}

// Initialize tasks on module load
(async () => {
  tasks = await loadTasks();
})();

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
  // Reload from storage to ensure we have the latest data
  tasks = await loadTasks();
  return [...tasks]; // Return a copy
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  await delay(300);
  // Reload from storage to ensure we have the latest data
  tasks = await loadTasks();
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
  await saveTasks(tasks); // Persist to storage
  return { ...newTask };
}

/**
 * Update an existing task
 */
export async function updateTask(data: UpdateTaskRequest): Promise<Task> {
  await delay(500);
  
  // Reload from storage to ensure we have the latest data
  tasks = await loadTasks();
  
  const taskIndex = tasks.findIndex((t) => t.id === data.id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  // Preserve original createdDate and id - don't allow them to be updated
  const { id, createdDate, ...updateData } = data;
  const originalTask = tasks[taskIndex];

  const updatedTask: Task = {
    ...originalTask,
    ...updateData,
    id: originalTask.id, // Ensure ID doesn't change
    createdDate: originalTask.createdDate, // Preserve original createdDate
  };

  tasks[taskIndex] = updatedTask;
  await saveTasks(tasks); // Persist to storage
  return { ...updatedTask };
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  await delay(400);
  
  // Reload from storage to ensure we have the latest data
  tasks = await loadTasks();
  
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  tasks.splice(taskIndex, 1);
  await saveTasks(tasks); // Persist to storage
}

/**
 * Mark task as complete
 */
export async function markTaskComplete(id: string): Promise<Task> {
  await delay(400);
  
  // Reload from storage to ensure we have the latest data
  tasks = await loadTasks();
  
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    status: 'Completed',
  };

  tasks[taskIndex] = updatedTask;
  await saveTasks(tasks); // Persist to storage
  return { ...updatedTask };
}
