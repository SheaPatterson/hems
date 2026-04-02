import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BaseScenery {
  id: string;
  base_id: string;
  image_urls: string[];
  zip_url: string | null; // Added zip_url
  description: string | null;
  created_at: string;
}

interface SceneryInput {
  base_id: string;
  image_urls: string[];
  description: string;
  zip_url?: string | null; // Added zip_url
}

const fetchAllScenery = async (): Promise<BaseScenery[]> => {
  const { data, error } = await supabase
    .from('base_scenery')
    .select('*');

  if (error) throw new Error(error.message);
  return data as BaseScenery[];
};

const upsertScenery = async (data: SceneryInput): Promise<BaseScenery> => {
  const { data: existing, error: fetchError } = await supabase
    .from('base_scenery')
    .select('id')
    .eq('base_id', data.base_id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(fetchError.message);
  }

  let result;
  const upsertData = { 
    image_urls: data.image_urls, 
    description: data.description,
    zip_url: data.zip_url,
    base_id: data.base_id,
  };

  if (existing) {
    result = await supabase
      .from('base_scenery')
      .update(upsertData)
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('base_scenery')
      .insert(upsertData)
      .select()
      .single();
  }

  if (result.error) throw new Error(result.error.message);
  return result.data as BaseScenery;
};

const deleteScenery = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('base_scenery')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const useBaseScenery = () => {
  const queryClient = useQueryClient();
  const queryKey = ['baseScenery'];

  const upsertMutation = useMutation({
    mutationFn: upsertScenery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Base scenery record updated.");
    },
    onError: (error: any) => {
      toast.error(`Save failed: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScenery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Scenery deleted.");
    },
    onError: (error: any) => {
      toast.error(`Delete failed: ${error.message}`);
    }
  });
  
  const sceneryQuery = useQuery({
      queryKey,
      queryFn: fetchAllScenery,
      staleTime: 1000 * 60 * 5,
  });

  return {
    scenery: sceneryQuery.data || [],
    isLoading: sceneryQuery.isLoading,
    isError: sceneryQuery.isError,
    upsertScenery: upsertMutation.mutateAsync,
    deleteScenery: deleteMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
    isDeleting: deleteMutation.isPending,
    sceneryQuery,
  };
};