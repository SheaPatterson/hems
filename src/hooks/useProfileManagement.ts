import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthGuard';
import { Profile } from './useProfiles';
import { toast } from 'sonner';

interface ProfileUpdateInput extends Partial<Omit<Profile, 'id' | 'updated_at' | 'api_key'>> {}

const fetchUserProfile = async (userId: string): Promise<Profile & { api_key: string } | null> => {
  if (!userId) return null;

  const { data: profile, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (pError && pError.code !== 'PGRST116') throw new Error(pError.message);

  const { data: keyData, error: kError } = await supabase
    .from('user_api_keys')
    .select('api_key')
    .eq('user_id', userId)
    .single();

  if (kError && kError.code !== 'PGRST116') throw new Error(kError.message);

  return { 
    ...profile, 
    api_key: keyData?.api_key || 'NONE',
    is_subscribed: true // Force premium access for all beta users
  } as any;
};

const updateUserProfile = async (userId: string, data: ProfileUpdateInput): Promise<Profile> => {
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updatedProfile as Profile;
};

const rotateApiKey = async (userId: string): Promise<string> => {
    const newKey = crypto.randomUUID();
    const { data, error } = await supabase
        .from('user_api_keys')
        .update({ api_key: newKey })
        .eq('user_id', userId)
        .select('api_key')
        .single();
    
    if (error) throw error;
    return data.api_key;
};

export const useProfileManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['userProfile', user?.id];

  const profileQuery = useQuery({
    queryKey,
    queryFn: () => fetchUserProfile(user?.id || ''),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileUpdateInput) => updateUserProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      toast.success("Personnel record updated.");
    }
  });

  const rotateKeyMutation = useMutation({
      mutationFn: () => rotateApiKey(user!.id),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
          toast.success("Security token rotated.");
      }
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isUpdating: updateMutation.isPending,
    isRotatingKey: rotateKeyMutation.isPending,
    updateProfile: updateMutation.mutateAsync,
    rotateApiKey: rotateKeyMutation.mutateAsync,
    initiateCheckout: async () => { toast.info("HEMS OPS-CENTER is free! Support the dev on Buy Me a Coffee."); },
    initiateCustomerPortal: async () => { toast.info("Standalone access enabled for all personnel."); },
    isInitiatingCheckout: false,
    isInitiatingPortal: false,
  };
};