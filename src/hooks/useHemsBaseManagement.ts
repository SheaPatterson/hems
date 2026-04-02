import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HemsBase } from '@/data/hemsData';

interface HemsBaseInput {
  name: string;
  location: string;
  contact: string | null;
  faaIdentifier: string | null;
  latitude: number;
  longitude: number;
  helicopterId: string | null;
}

const insertHemsBase = async (data: HemsBaseInput): Promise<HemsBase> => {
  const { data: newBase, error } = await supabase
    .from('hems_bases')
    .insert({
      name: data.name,
      location: data.location,
      contact: data.contact,
      faa_identifier: data.faaIdentifier,
      latitude: data.latitude,
      longitude: data.longitude,
      helicopter_id: data.helicopterId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: newBase.id,
    name: newBase.name,
    location: newBase.location,
    contact: newBase.contact,
    faaIdentifier: newBase.faa_identifier,
    latitude: newBase.latitude,
    longitude: newBase.longitude,
    assignedHelicopterRegistration: null, // Placeholder, will be refreshed by query invalidation
    helicopterId: newBase.helicopter_id,
    createdAt: newBase.created_at,
  };
};

const updateHemsBase = async (id: string, data: HemsBaseInput): Promise<HemsBase> => {
  const { data: updatedBase, error } = await supabase
    .from('hems_bases')
    .update({
      name: data.name,
      location: data.location,
      contact: data.contact,
      faa_identifier: data.faaIdentifier,
      latitude: data.latitude,
      longitude: data.longitude,
      helicopter_id: data.helicopterId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: updatedBase.id,
    name: updatedBase.name,
    location: updatedBase.location,
    contact: updatedBase.contact,
    faaIdentifier: updatedBase.faa_identifier,
    latitude: updatedBase.latitude,
    longitude: updatedBase.longitude,
    assignedHelicopterRegistration: null, // Placeholder, will be refreshed by query invalidation
    helicopterId: updatedBase.helicopter_id,
    createdAt: updatedBase.created_at,
  };
};

const deleteHemsBase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('hems_bases')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const useHemsBaseManagement = () => {
  const queryClient = useQueryClient();
  const queryKey = ['hemsBases']; // Use 'hemsBases' key from useHemsData

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['helicopters'] }); // Invalidate helicopters too, as they reference bases
  };

  const createMutation = useMutation({
    mutationFn: insertHemsBase,
    onSuccess: () => invalidateQueries(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HemsBaseInput }) => updateHemsBase(id, data),
    onSuccess: () => invalidateQueries(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHemsBase,
    onSuccess: () => invalidateQueries(),
  });

  return {
    createHemsBase: createMutation.mutateAsync,
    updateHemsBase: updateMutation.mutateAsync,
    deleteHemsBase: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};