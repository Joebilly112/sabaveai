import { getListBusinessesQueryKey } from '@workspace/api-client-react';

export function userHeaders(userId: string) {
  return { headers: { 'x-user-id': userId } };
}

export function listBusinessesQuery(userId: string) {
  return {
    query: {
      enabled: !!userId,
      queryKey: [...getListBusinessesQueryKey(), userId],
    },
    request: userHeaders(userId),
  };
}
