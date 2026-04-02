import { useQuery } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { DynamicContent } from './useContent';

const fetchAllDynamicContent = async (): Promise<DynamicContent[]> => {
  const response = await azureClient.functions.invoke('content', { method: 'GET' });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("Error fetching all dynamic content:", err);
    throw new Error(err.error || 'Failed to fetch content');
  }
  return await response.json() as DynamicContent[];
};

export const useAllContent = () => {
  return useQuery({
    queryKey: ['allDynamicContent'],
    queryFn: fetchAllDynamicContent,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
