import {
    createTask as createTaskAPI,
    getAllTasks,
    getTaskById,
    markTaskComplete,
    updateTask as updateTaskAPI,
    type CreateTaskRequest,
    type UpdateTaskRequest,
} from '@/api/mock/tasks';
import { taskQueryKeys } from '@/api/query-keys';
import type { Task } from '@/components/TaskCard';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { queueMutation } from '@/services/offlineQueue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

/**
 * Helper function to convert date strings to Date objects in tasks
 */
function normalizeTaskDates(tasks: Task[]): Task[] {
  return tasks.map((task) => {
    const normalized = { ...task };
    
    // Convert dueDate if it's a string
    if (normalized.dueDate && typeof normalized.dueDate === 'string') {
      normalized.dueDate = new Date(normalized.dueDate);
    }
    
    // Convert createdDate if it's a string
    if (normalized.createdDate && typeof normalized.createdDate === 'string') {
      normalized.createdDate = new Date(normalized.createdDate);
    }
    
    return normalized;
  });
}

/**
 * Get all tasks
 */
export function useTasks() {
  const { isOnline } = useNetworkStatus();

  return useQuery<Task[]>({
    queryKey: taskQueryKeys.all.queryKey,
    queryFn: async () => {
      const tasks = await getAllTasks();
      return normalizeTaskDates(tasks);
    },
    staleTime: 0, // Always refetch when online
    gcTime: Infinity, // Keep cache forever for offline access (React Query v5)
    retry: false, // Don't retry when offline
    refetchOnMount: isOnline, // Only refetch when online
    refetchOnWindowFocus: isOnline, // Only refetch when online
    networkMode: isOnline ? 'online' : 'offlineFirst', // Use cache when offline
    select: (data) => normalizeTaskDates(data), // Normalize dates from cache too
  });
}

/**
 * Get a single task by ID
 */
export function useTask(id: string) {
  const queryClient = useQueryClient();
  
  return useQuery<Task | null>({
    queryKey: taskQueryKeys.detail(id).queryKey,
    queryFn: async () => {
      const task = await getTaskById(id);
      if (!task) return null;
      return normalizeTaskDates([task])[0];
    },
    enabled: !!id,
    staleTime: 0,
    // Use cached data from all tasks query if available for instant display
    placeholderData: () => {
      const allTasks = queryClient.getQueryData<Task[]>(taskQueryKeys.all.queryKey);
      if (allTasks) {
        const cachedTask = allTasks.find((t) => t.id === id);
        if (cachedTask) {
          return normalizeTaskDates([cachedTask])[0];
        }
      }
      return undefined;
    },
    select: (data) => {
      if (!data) return null;
      return normalizeTaskDates([data])[0];
    },
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation<Task, Error, CreateTaskRequest>({
    mutationFn: async (data) => {
      if (!isOnline) {
        // Queue mutation when offline
        await queueMutation({
          type: 'create',
          data,
        });
        // Return a temporary task object for optimistic update
        return {
          id: `temp_${Date.now()}`,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate,
          category: data.category,
          createdDate: data.createdDate,
          _isPending: true, // Mark as pending
        } as Task & { _isPending?: boolean };
      }
      return await createTaskAPI(data);
    },
    onSuccess: (data) => {
      if (isOnline) {
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all.queryKey });
        // Delay navigation to allow toast to show
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      } else {
        // Optimistically update cache when offline
        queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
          const normalizedData = normalizeTaskDates([data as Task])[0];
          return [normalizedData, ...normalizeTaskDates(old)];
        });
        // Delay navigation to allow toast to show
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      }
    },
  });
}

/**
 * Update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation<Task, Error, UpdateTaskRequest>({
    mutationFn: async (data) => {
      if (!isOnline) {
        // Queue mutation when offline
        await queueMutation({
          type: 'update',
          taskId: data.id,
          data,
        });
        // Return updated task for optimistic update
        const currentTasks = queryClient.getQueryData<Task[]>(taskQueryKeys.all.queryKey) || [];
        const existingTask = currentTasks.find((t) => t.id === data.id);
        return {
          ...existingTask!,
          ...data,
          _isPending: true, // Mark as pending
        } as Task & { _isPending?: boolean };
      }
      return await updateTaskAPI(data);
    },
    onSuccess: (data) => {
      if (isOnline) {
        // Update the specific task in cache immediately
        queryClient.setQueryData<Task | null>(
          taskQueryKeys.detail(data.id).queryKey,
          normalizeTaskDates([data as Task])[0]
        );
        
        // Update the task in the all tasks list
        queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
          const normalizedData = normalizeTaskDates([data as Task])[0];
          return normalizeTaskDates(old).map((task) => (task.id === data.id ? normalizedData : task));
        });
        
        // Invalidate to refetch and ensure consistency
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all.queryKey });
        queryClient.invalidateQueries({
          queryKey: taskQueryKeys.detail(data.id).queryKey,
        });
        
        // Delay navigation to allow toast to show
        setTimeout(() => {
          router.replace('/(tabs)/tasks/tasks');
        }, 2000);
      } else {
        // Optimistically update cache when offline
        queryClient.setQueryData<Task | null>(
          taskQueryKeys.detail(data.id).queryKey,
          normalizeTaskDates([data as Task])[0]
        );
        queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
          const normalizedData = normalizeTaskDates([data as Task])[0];
          return normalizeTaskDates(old).map((task) => (task.id === data.id ? normalizedData : task));
        });
        // Delay navigation to allow toast to show
        setTimeout(() => {
          router.replace('/(tabs)/tasks/tasks');
        }, 2000);
      }
    },
  });
}

/**
 * Mark task as complete
 */
export function useMarkTaskComplete() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  return useMutation<Task, Error, string>({
    mutationFn: async (id) => {
      if (!isOnline) {
        // Queue mutation when offline
        await queueMutation({
          type: 'markComplete',
          taskId: id,
          data: { status: 'Completed' },
        });
        // Return updated task for optimistic update
        const currentTasks = queryClient.getQueryData<Task[]>(taskQueryKeys.all.queryKey) || [];
        const existingTask = currentTasks.find((t) => t.id === id);
        return {
          ...existingTask!,
          status: 'Completed',
          _isPending: true, // Mark as pending
        } as Task & { _isPending?: boolean };
      }
      return await markTaskComplete(id);
    },
    onSuccess: (data) => {
      if (isOnline) {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all.queryKey });
        queryClient.invalidateQueries({
          queryKey: taskQueryKeys.detail(data.id).queryKey,
        });
        // Delay navigation to allow toast to show
        setTimeout(() => {
          router.replace('/(tabs)/tasks/tasks');
        }, 2000);
      } else {
        // Optimistically update cache when offline
        queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
          return normalizeTaskDates(old).map((task) =>
            task.id === data.id ? { ...task, status: 'Completed' as const } : task
          );
        });
        // Delay navigation to allow toast to show
        setTimeout(() => {
          router.replace('/(tabs)/tasks/tasks');
        }, 2000);
      }
    },
  });
}
