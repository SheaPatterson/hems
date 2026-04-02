import { useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { Helicopter } from '@/data/hemsData';

interface HelicopterInput {
  model: string;
  registration: string;
  fuelCapacityLbs: number;
  cruiseSpeedKts: number;
  fuelBurnRateLbHr: number;
  imageUrl?: string | null;
  maintenanceStatus: 'FMC' | 'AOG';
}

const insertHelicopter = async (data: HelicopterInput): Promise<Helicopter> => {
  const response = await azureClient.functions.invoke('helicopters', {
    method: 'POST',
    body: {
      model: data.model,
      registration: data.registration,
      fuel_capacity_lbs: data.fuelCapacityLbs,
      cruise_speed_kts: data.cruiseSpeedKts,
      fuel_burn_rate_lb_hr: data.fuelBurnRateLbHr,
      image_url: data.imageUrl,
      maintenance_status: data.maintenanceStatus,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create helicopter');
  }

  const newHelicopter = await response.json();
  return {
    id: newHelicopter.id,
    model: newHelicopter.model,
    registration: newHelicopter.registration,
    fuelCapacityLbs: newHelicopter.fuel_capacity_lbs,
    cruiseSpeedKts: newHelicopter.cruise_speed_kts,
    fuelBurnRateLbHr: newHelicopter.fuel_burn_rate_lb_hr,
    imageUrl: newHelicopter.image_url,
    maintenanceStatus: newHelicopter.maintenance_status,
    createdAt: newHelicopter.created_at,
  };
};

const updateHelicopter = async (id: string, data: HelicopterInput): Promise<Helicopter> => {
  const response = await azureClient.functions.invoke(`helicopters/${id}`, {
    method: 'PATCH',
    body: {
      model: data.model,
      registration: data.registration,
      fuel_capacity_lbs: data.fuelCapacityLbs,
      cruise_speed_kts: data.cruiseSpeedKts,
      fuel_burn_rate_lb_hr: data.fuelBurnRateLbHr,
      image_url: data.imageUrl,
      maintenance_status: data.maintenanceStatus,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update helicopter');
  }

  const updatedHelicopter = await response.json();
  return {
    id: updatedHelicopter.id,
    model: updatedHelicopter.model,
    registration: updatedHelicopter.registration,
    fuelCapacityLbs: updatedHelicopter.fuel_capacity_lbs,
    cruiseSpeedKts: updatedHelicopter.cruise_speed_kts,
    fuelBurnRateLbHr: updatedHelicopter.fuel_burn_rate_lb_hr,
    imageUrl: updatedHelicopter.image_url,
    maintenanceStatus: updatedHelicopter.maintenance_status,
    createdAt: updatedHelicopter.created_at,
  };
};

const deleteHelicopter = async (id: string): Promise<void> => {
  const response = await azureClient.functions.invoke(`helicopters/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete helicopter');
  }
};

export const useHelicopterManagement = () => {
  const queryClient = useQueryClient();
  const queryKey = ['helicopters'];

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['hemsBases'] });
  };

  const createMutation = useMutation({
    mutationFn: insertHelicopter,
    onSuccess: () => invalidateQueries(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HelicopterInput }) => updateHelicopter(id, data),
    onSuccess: () => invalidateQueries(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHelicopter,
    onSuccess: () => invalidateQueries(),
  });

  return {
    createHelicopter: createMutation.mutateAsync,
    updateHelicopter: updateMutation.mutateAsync,
    deleteHelicopter: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
