import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';

export interface ConfigItem {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

interface ConfigUpdateInput {
  key: string;
  value: string;
  description?: string | null;
}

const fetchAllConfig = async (): Promise<ConfigItem[]> => {
  const response = await azureClient.functions.invoke('config', { method: 'GET' });
  if (!response.ok) {
    console.error("Error fetching configuration");
    throw new Error('Failed to fetch configuration');
  }
  const data = await response.json();
  return data as ConfigItem[];
};

const upsertConfig = async (data: ConfigUpdateInput): Promise<ConfigItem> => {
  const response = await azureClient.functions.invoke('config', {
    method: 'PUT',
    body: data,
  });
  if (!response.ok) throw new Error('Failed to save configuration');
  const result = await response.json();
  return result as ConfigItem;
};

export const useConfig = () => {
  const queryClient = useQueryClient();
  const queryKey = ['systemConfig'];

  const configQuery = useQuery({
    queryKey,
    queryFn: fetchAllConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const upsertMutation = useMutation({
    mutationFn: upsertConfig,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`Setting '${data.key}' updated successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to save configuration: ${error.message}`);
    }
  });

  return {
    config: configQuery.data || [],
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    upsertConfig: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
};
