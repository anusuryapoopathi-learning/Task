import { createQueryKeys } from '@barehera/query-key-factory';

export const queryKeys = createQueryKeys('auth', {
  me: {
    queryKey: null,
    queryFn: async () => null, // Will be overridden in useAuth
  },
  login: {
    queryKey: null,
    queryFn: async () => null, // Not used as a query, just for key structure
  },
});

export const taskQueryKeys = createQueryKeys('tasks', {
  all: {
    queryKey: null,
    queryFn: async () => null, // Will be overridden in useTasks
  },
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: async () => null, // Will be overridden in useTask
  }),
});
