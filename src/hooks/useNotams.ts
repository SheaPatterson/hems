import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';

export interface Notam {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  active: boolean;
  created_at: string;
}

const fetchNotams = async (): Promise<Notam[]> => {
  const response = await azureClient.functions.invoke('notams', { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch NOTAMs');
  const data = await response.json();
  return data as Notam[];
};

export const useNotams = () => {
  const queryClient = useQueryClient();
  const queryKey = ['notams'];

  const notamsQuery = useQuery({
    queryKey,
    queryFn: fetchNotams,
  });

  const createNotam = useMutation({
    mutationFn: async (notam: Omit<Notam, 'id' | 'created_at' | 'active'>) => {
        const session = await azureClient.auth.getSession();
        const response = await azureClient.functions.invoke('notams', {
          method: 'POST',
          body: { ...notam, user_id: session?.user.id },
        });
        if (!response.ok) throw new Error('Failed to create NOTAM');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("NOTAM broadcasted successfully.");
    }
  });

  const deactivateNotam = useMutation({
    mutationFn: async (id: string) => {
        const response = await azureClient.functions.invoke(`notams/${id}`, {
          method: 'PATCH',
          body: { active: false },
        });
        if (!response.ok) throw new Error('Failed to archive NOTAM');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("NOTAM archived.");
    }
  });

  return {
    notams: notamsQuery.data || [],
    isLoading: notamsQuery.isLoading,
    createNotam: createNotam.mutateAsync,
    deactivateNotam: deactivateNotam.mutateAsync,
    isCreating: createNotam.isPending,
  };
};
