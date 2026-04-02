import { useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';
import { DynamicContent } from './useContent';

interface ContentUpdateInput {
  slug: string;
  title: string;
  body: string;
}

interface UpsertContentPayload extends ContentUpdateInput {
  id: string | null; // null for insert, string for update
}

const upsertContent = async (payload: UpsertContentPayload): Promise<DynamicContent> => {
  const contentData = {
    slug: payload.slug,
    title: payload.title,
    body: payload.body,
    updated_at: new Date().toISOString(),
  };

  let response: Response;

  if (payload.id) {
    // Update existing content
    response = await azureClient.functions.invoke(`content/${payload.id}`, {
      method: 'PATCH',
      body: contentData,
    });
  } else {
    // Insert new content
    response = await azureClient.functions.invoke('content', {
      method: 'POST',
      body: contentData,
    });
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save content');
  }

  return await response.json() as DynamicContent;
};

export const useContentManagement = () => {
  const queryClient = useQueryClient();

  const upsertMutation = useMutation({
    mutationFn: upsertContent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dynamicContent', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['allDynamicContent'] });
      toast.success(`Content for '${data.title}' saved successfully.`);
    },
    onError: (error: any) => {
      toast.error(`Failed to save content: ${error.message}`);
      console.error("Content save error:", error);
    }
  });

  return {
    upsertContent: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
};
