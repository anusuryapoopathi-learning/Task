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
  return useQuery<Task | null>({
    queryKey: taskQueryKeys.detail(id).queryKey,
    queryFn: async () => {
      const task = await getTaskById(id);
      if (!task) return null;
      return normalizeTaskDates([task])[0];
    },
    enabled: !!id,
    staleTime: 0,
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
        // Navigate to dashboard
        router.replace('/(tabs)');
      } else {
        // Optimistically update cache when offline
        queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
          const normalizedData = normalizeTaskDates([data as Task])[0];
          return [normalizedData, ...normalizeTaskDates(old)];
        });
        // Navigate to dashboard
        router.replace('/(tabs)');
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
        // Invalidate all tasks and specific task
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all.queryKey });
        queryClient.invalidateQueries({
          queryKey: taskQueryKeys.detail(data.id).queryKey,
        });
        // Navigate to tasks screen
        router.replace('/(tabs)/tasks');
      } else {
        // Optimistically update cache when offline
        queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
          const normalizedData = normalizeTaskDates([data as Task])[0];
          return normalizeTaskDates(old).map((task) => (task.id === data.id ? normalizedData : task));
        });
        // Navigate to tasks screen
        router.replace('/(tabs)/tasks');
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
        // Navigate to tasks screen
        router.replace('/(tabs)/tasks');
      } else {
        // Optimistically update cache when offline
        queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
          return normalizeTaskDates(old).map((task) =>
            task.id === data.id ? { ...task, status: 'Completed' as const } : task
          );
        });
        // Navigate to tasks screen
        router.replace('/(tabs)/tasks');
      }
    },
  });
}
