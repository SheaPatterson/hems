import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string;
  location?: string | null;
  email_public?: string | null;
  simulators?: string | null;
  experience?: string | null;
  bio?: string | null;
  social_links?: {
    linkedin?: string;
    discord?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  is_subscribed?: boolean;
}

const fetchAllProfiles = async (): Promise<Profile[]> => {
  const response = await azureClient.functions.invoke('profiles', { method: 'GET' });
  if (!response.ok) {
    console.error("Error fetching profiles");
    throw new Error('Failed to fetch profiles');
  }
  const data = await response.json();
  return data as Profile[];
};

const updateProfileByAdmin = async (profile: Partial<Profile> & { id: string }): Promise<Profile> => {
  const response = await azureClient.functions.invoke(`profiles/${profile.id}`, {
    method: 'PATCH',
    body: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar_url: profile.avatar_url,
      location: profile.location,
      email_public: profile.email_public,
      simulators: profile.simulators,
      experience: profile.experience,
      bio: profile.bio,
      social_links: profile.social_links,
      updated_at: new Date().toISOString(),
    },
  });

  if (!response.ok) throw new Error('Failed to update profile');
  const data = await response.json();
  return data as Profile;
};

export const useProfiles = () => {
  const queryClient = useQueryClient();
  
  const profilesQuery = useQuery({
    queryKey: ['allProfiles'],
    queryFn: fetchAllProfiles,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const updateMutation = useMutation({
    mutationFn: updateProfileByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      toast.success("User profile updated successfully.");
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });

  return {
    ...profilesQuery,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
