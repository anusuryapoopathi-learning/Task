import {
    createTask as createTaskAPI,
    markTaskComplete,
    updateTask as updateTaskAPI,
    type CreateTaskRequest,
    type UpdateTaskRequest,
} from '@/api/mock/tasks';
import { taskQueryKeys } from '@/api/query-keys';
import type { Task } from '@/components/TaskCard';
import { getQueuedMutations, removeQueuedMutation } from '@/services/offlineQueue';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineSync() {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    if (isOnline) {
      syncQueuedMutations();
    }
  }, [isOnline]);

  const syncQueuedMutations = async () => {
    const queue = await getQueuedMutations();
    if (queue.length === 0) return;

    setIsSyncing(true);

    try {
      // Process mutations in order
      for (const mutation of queue) {
        try {
          // Helper function to convert date strings to Date objects
          const convertDates = (
            data: CreateTaskRequest | Partial<UpdateTaskRequest>
          ): CreateTaskRequest | UpdateTaskRequest => {
            if (!data || typeof data !== 'object') {
              throw new Error('Invalid data for date conversion');
            }
            
            const converted = { ...data };
            
            // Convert dueDate if it's a string
            if ('dueDate' in converted && converted.dueDate && typeof converted.dueDate === 'string') {
              converted.dueDate = new Date(converted.dueDate);
            }
            
            // Convert createdDate if it's a string
            if ('createdDate' in converted && converted.createdDate && typeof converted.createdDate === 'string') {
              converted.createdDate = new Date(converted.createdDate);
            }
            
            return converted as CreateTaskRequest | UpdateTaskRequest;
          };

          switch (mutation.type) {
            case 'create':
              await createTaskAPI(convertDates(mutation.data) as CreateTaskRequest);
              break;
            case 'update':
              if (mutation.taskId) {
                await updateTaskAPI({
                  id: mutation.taskId,
                  ...convertDates(mutation.data),
                } as UpdateTaskRequest);
              }
              break;
            case 'markComplete':
              if (mutation.taskId) {
                await markTaskComplete(mutation.taskId);
              }
              break;
            case 'delete':
              // Handle delete if needed
              break;
          }

          // Remove from queue after successful sync
          await removeQueuedMutation(mutation.id);
        } catch (error) {
          console.error(`Error syncing mutation ${mutation.id}:`, error);
          // Continue with next mutation even if one fails
        }
      }

      // Remove pending flags from tasks and normalize dates
      queryClient.setQueryData<Task[]>(taskQueryKeys.all.queryKey, (old = []) => {
        return old.map((task) => {
          const { _isPending, ...taskWithoutPending } = task;
          // Normalize dates (convert strings to Date objects)
          const normalized = { ...taskWithoutPending };
          if (normalized.dueDate && typeof normalized.dueDate === 'string') {
            normalized.dueDate = new Date(normalized.dueDate);
          }
          if (normalized.createdDate && typeof normalized.createdDate === 'string') {
            normalized.createdDate = new Date(normalized.createdDate);
          }
          return normalized;
        });
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all.queryKey });

      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSyncTime,
    syncQueuedMutations,
  };
}
