import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';

export interface DownloadItem {
  id: string;
  category: string;
  title: string;
  file_url: string;
  description: string | null;
  created_at: string;
}

interface DownloadInput {
  category: string;
  title: string;
  file_url: string;
  description: string | null;
}

const fetchAllDownloads = async (): Promise<DownloadItem[]> => {
  const response = await azureClient.functions.invoke('downloads', { method: 'GET' });
  if (!response.ok) {
    console.error("Error fetching downloads");
    throw new Error('Failed to fetch downloads');
  }
  const data = await response.json();
  return data as DownloadItem[];
};

const upsertDownload = async (data: DownloadInput & { id?: string }): Promise<DownloadItem> => {
  let response: Response;
  if (data.id) {
    // Update existing
    response = await azureClient.functions.invoke(`downloads/${data.id}`, {
      method: 'PATCH',
      body: {
        category: data.category,
        title: data.title,
        file_url: data.file_url,
        description: data.description,
      },
    });
  } else {
    // Insert new
    response = await azureClient.functions.invoke('downloads', {
      method: 'POST',
      body: data,
    });
  }

  if (!response.ok) throw new Error('Failed to save download');
  const result = await response.json();
  return result as DownloadItem;
};

const deleteDownload = async (id: string): Promise<void> => {
  const response = await azureClient.functions.invoke(`downloads/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete download');
};

export const useDownloads = () => {
  const queryClient = useQueryClient();
  const queryKey = ['downloads'];

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const upsertMutation = useMutation({
    mutationFn: upsertDownload,
    onSuccess: () => {
      invalidateQueries();
      toast.success("Download link saved successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to save download: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDownload,
    onSuccess: () => {
      invalidateQueries();
      toast.success("Download link deleted successfully.");
    },
    onError: (error) => {
      toast.error(`Failed to delete download: ${error.message}`);
    }
  });
  
  const downloadsQuery = useQuery({
      queryKey,
      queryFn: fetchAllDownloads,
      staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    downloads: downloadsQuery.data || [],
    isLoading: downloadsQuery.isLoading,
    isError: downloadsQuery.isError,
    upsertDownload: upsertMutation.mutateAsync,
    deleteDownload: deleteMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
    isDeleting: deleteMutation.isPending,
    downloadsQuery,
  };
};
