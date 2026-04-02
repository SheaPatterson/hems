import { useQuery } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';

export interface LivePilot {
    user_id: string;
    last_seen: string;
    latitude: number;
    longitude: number;
    altitude_ft: number;
    ground_speed_kts: number;
    heading_deg: number;
    fuel_remaining_lbs: number;
    phase: string;
    callsign: string;
}

const fetchLivePilots = async (): Promise<LivePilot[]> => {
    const response = await azureClient.functions.invoke('live-pilots', { method: 'GET' });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch live pilots');
    }
    return await response.json() as LivePilot[];
};

export const useLivePilots = () => {
    return useQuery({
        queryKey: ['livePilots'],
        queryFn: fetchLivePilots,
        refetchInterval: 10000, // Poll every 10s for global map updates
    });
};
