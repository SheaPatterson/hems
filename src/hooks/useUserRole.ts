import { azureClient } from '@/integrations/azure/client';
import { useAuth } from '@/components/AuthGuard';
import { useQuery } from '@tanstack/react-query';

const fetchUserRoles = async (userId: string): Promise<string[]> => {
    if (!userId) return [];

    try {
        const response = await azureClient.functions.invoke(`user-roles/${userId}`, { method: 'GET' });
        if (!response.ok) return [];
        const data = await response.json();
        // Azure endpoint returns [{ role_id: 'admin' }] records — map to string[]
        return (data || []).map((r: any) => r.role_id);
    } catch (e) {
        return [];
    }
};

export const useUserRole = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: roles = [], isLoading: isRoleLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: () => fetchUserRoles(user!.id),
    enabled: !!user && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
  });

  const isAdmin = roles.includes('admin');

  return { roles, isAdmin, isLoading: isRoleLoading || isAuthLoading };
};
