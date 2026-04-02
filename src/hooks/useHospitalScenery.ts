import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HospitalScenery {
    id: string;
    hospital_id: string;
    description: string | null;
    image_urls: string[];
    zip_url: string | null;
    created_at: string;
}

interface SceneryInput {
    hospital_id: string;
    image_urls: string[];
    description: string;
    zip_url?: string | null;
}

const fetchHospitalScenery = async (): Promise<HospitalScenery[]> => {
    const { data, error } = await supabase
        .from('hospital_scenery')
        .select('*');

    if (error) throw new Error(error.message);
    return data as HospitalScenery[];
};

const upsertScenery = async (data: SceneryInput): Promise<HospitalScenery> => {
    const { data: existing, error: fetchError } = await supabase
        .from('hospital_scenery')
        .select('id')
        .eq('hospital_id', data.hospital_id)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(fetchError.message);
    }

    let result;
    const upsertData = { 
        image_urls: data.image_urls, 
        description: data.description,
        zip_url: data.zip_url,
        hospital_id: data.hospital_id,
    };

    if (existing) {
        result = await supabase
            .from('hospital_scenery')
            .update(upsertData)
            .eq('id', existing.id)
            .select()
            .single();
    } else {
        result = await supabase
            .from('hospital_scenery')
            .insert(upsertData)
            .select()
            .single();
    }

    if (result.error) throw new Error(result.error.message);
    return result.data as HospitalScenery;
};

const deleteScenery = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('hospital_scenery')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
};

export const useHospitalScenery = () => {
    const queryClient = useQueryClient();
    const queryKey = ['hospitalScenery'];

    const upsertMutation = useMutation({
        mutationFn: upsertScenery,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success("Scenery record updated.");
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
        queryFn: fetchHospitalScenery,
        staleTime: 1000 * 60 * 5,
    });

    return {
        sceneryQuery,
        upsertScenery: upsertMutation.mutateAsync,
        deleteScenery: deleteMutation.mutateAsync,
        isSaving: upsertMutation.isPending,
        isDeleting: deleteMutation.isPending,
        refetch: sceneryQuery.refetch,
    };
};