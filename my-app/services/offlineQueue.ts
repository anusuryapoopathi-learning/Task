import { asyncStorage } from '@/lib/storage';

const QUEUE_KEY = 'offline_mutation_queue';

export type MutationType = 'create' | 'update' | 'delete' | 'markComplete';

export interface QueuedMutation {
  id: string;
  type: MutationType;
  timestamp: number;
  data: any;
  taskId?: string; // For update/delete/markComplete
}

/**
 * Get all queued mutations
 */
export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  try {
    const queue = await asyncStorage.getItem<QueuedMutation[]>(QUEUE_KEY);
    return queue || [];
  } catch (error) {
    console.error('Error getting queued mutations:', error);
    return [];
  }
}

/**
 * Add a mutation to the queue
 */
export async function queueMutation(mutation: Omit<QueuedMutation, 'id' | 'timestamp'>): Promise<void> {
  try {
    const queue = await getQueuedMutations();
    const newMutation: QueuedMutation = {
      ...mutation,
      id: `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    queue.push(newMutation);
    await asyncStorage.setItem(QUEUE_KEY, queue);
  } catch (error) {
    console.error('Error queueing mutation:', error);
  }
}

/**
 * Remove a mutation from the queue
 */
export async function removeQueuedMutation(mutationId: string): Promise<void> {
  try {
    const queue = await getQueuedMutations();
    const filtered = queue.filter((m) => m.id !== mutationId);
    await asyncStorage.setItem(QUEUE_KEY, filtered);
  } catch (error) {
    console.error('Error removing queued mutation:', error);
  }
}

/**
 * Clear all queued mutations
 */
export async function clearQueue(): Promise<void> {
  try {
    await asyncStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing queue:', error);
  }
}

/**
 * Get pending mutations count
 */
export async function getPendingMutationsCount(): Promise<number> {
  const queue = await getQueuedMutations();
  return queue.length;
}

/**
 * Get pending mutations for a specific task
 */
export async function getPendingMutationsForTask(taskId: string): Promise<QueuedMutation[]> {
  const queue = await getQueuedMutations();
  return queue.filter((m) => m.taskId === taskId);
}
