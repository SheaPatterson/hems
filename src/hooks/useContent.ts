import { useQuery } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';

export interface DynamicContent {
  id: string;
  slug: string;
  title: string;
  body: string;
  updated_at: string;
}

const fetchContentBySlug = async (slug: string): Promise<DynamicContent | null> => {
  if (!slug) return null;

  const response = await azureClient.functions.invoke(`content/${slug}`, { method: 'GET' });

  if (response.status === 404) return null;
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error(`Error fetching content for slug ${slug}:`, err);
    throw new Error(err.error || 'Failed to fetch content');
  }

  return await response.json() as DynamicContent;
};

export const useContent = (slug: string) => {
  return useQuery({
    queryKey: ['dynamicContent', slug],
    queryFn: () => fetchContentBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const fetchAllContent = async (): Promise<DynamicContent[]> => {
  const response = await azureClient.functions.invoke('content', { method: 'GET' });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error("Error fetching all content:", err);
    throw new Error(err.error || 'Failed to fetch content');
  }
  return await response.json() as DynamicContent[];
};
