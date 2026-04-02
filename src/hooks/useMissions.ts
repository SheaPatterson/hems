import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { MissionReport } from '@/data/hemsData';
import { toast } from 'sonner';

export interface HistoricalMission extends MissionReport {
    id: string;
    user_id: string;
    created_at: string;
    status: 'active' | 'completed' | 'cancelled';
    pilot_notes?: string | null;
    performance_score?: number;
    flight_summary?: any;
}

const mapMission = (m: any): HistoricalMission => ({
    ...m,
    missionId: m.mission_id,
    type: m.mission_type,
    hemsBase: m.hems_base,
    helicopter: m.helicopter,
    patientAge: m.patient_age,
    patientGender: m.patient_gender,
    patientWeightLbs: m.patient_weight_lbs,
    patientDetails: m.patient_details,
    medicalResponse: m.medical_response,
    dateTime: m.created_at,
    tracking: m.tracking,
    waypoints: m.waypoints,
    liveData: m.live_data,
    origin: m.origin,
    destination: m.destination,
    status: m.status || 'active',
    pilot_notes: m.pilot_notes,
    performance_score: m.performance_score,
    flight_summary: m.flight_summary,
    user_id: m.user_id,
});

const fetchMissions = async (userId?: string, status?: HistoricalMission['status'] | 'all'): Promise<HistoricalMission[]> => {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (status && status !== 'all') params.set('status', status);

    const query = params.toString();
    const endpoint = query ? `missions?${query}` : 'missions';

    const response = await azureClient.functions.invoke(endpoint, { method: 'GET' });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch missions');
    }

    const data = await response.json();
    return (data || []).map(mapMission) as HistoricalMission[];
};

const fetchMissionReport = async (missionId: string): Promise<HistoricalMission | null> => {
    if (!missionId) return null;

    const response = await azureClient.functions.invoke(`missions/${missionId}`, { method: 'GET' });

    if (response.status === 404) return null;
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch mission');
    }

    const data = await response.json();
    if (!data) return null;

    return mapMission(data);
};

export const useMissionReport = (missionId?: string) => {
    return useQuery({
        queryKey: ['missionReport', missionId],
        queryFn: () => fetchMissionReport(missionId!),
        enabled: !!missionId,
    });
};

export const useMissions = (userId?: string, status?: HistoricalMission['status'] | 'all') => {
    return useQuery({
        queryKey: ['missions', userId, status],
        queryFn: () => fetchMissions(userId, status),
    });
};

export const usePilotSummary = (userId?: string) => {
    const { data: missions } = useMissions(userId, 'completed');

    const stats = (missions || []).reduce((acc, m) => {
        acc.count += 1;
        acc.totalMinutes += m.tracking?.timeEnrouteMinutes || 0;
        acc.avgScore = (acc.avgScore * (acc.count - 1) + (m.performance_score || 0)) / acc.count;
        return acc;
    }, { count: 0, totalMinutes: 0, avgScore: 0 });

    return stats;
};

export const useActiveMissions = () => {
    return useQuery({
        queryKey: ['activeMissions'],
        queryFn: async () => {
            // Fetch telemetry summary data
            const summaryResponse = await azureClient.functions.invoke('telemetry-summary', { method: 'GET' });
            if (!summaryResponse.ok) throw new Error('Failed to fetch telemetry summary');
            const summaries = await summaryResponse.json();

            const missionIds = summaries.map((s: any) => s.mission_id);
            if (missionIds.length === 0) return [];

            // Fetch the full mission details for active missions
            const missionsResponse = await azureClient.functions.invoke(
                `missions?missionIds=${missionIds.join(',')}`,
                { method: 'GET' }
            );
            if (!missionsResponse.ok) throw new Error('Failed to fetch active missions');
            const missions = await missionsResponse.json();

            // Merge summary data into the full mission structure
            const summaryMap = new Map(summaries.map((s: any) => [s.mission_id, s]));

            return (missions || []).map((m: any) => {
                const summary = summaryMap.get(m.mission_id) as any;

                const tracking = {
                    ...m.tracking,
                    latitude: summary?.latitude || m.tracking.latitude,
                    longitude: summary?.longitude || m.tracking.longitude,
                    phase: summary?.phase || m.tracking.phase,
                    fuelRemainingLbs: summary?.fuel_remaining_lbs || m.tracking.fuelRemainingLbs,
                };

                return {
                    ...m,
                    missionId: m.mission_id,
                    type: m.mission_type,
                    hemsBase: m.hems_base,
                    helicopter: m.helicopter,
                    tracking: tracking,
                    origin: m.origin,
                    destination: m.destination,
                    status: m.status,
                    pilot_notes: m.pilot_notes,
                    user_id: m.user_id,
                } as HistoricalMission;
            });
        },
        refetchInterval: 10000,
    });
};

export const useMissionManagement = () => {
    const queryClient = useQueryClient();

    const updateStatus = useMutation({
        mutationFn: async ({
            missionId,
            status,
            pilotNotes,
            performanceScore,
            flightSummary,
        }: {
            missionId: string;
            status: string;
            pilotNotes?: string;
            performanceScore?: number;
            flightSummary?: any;
        }) => {
            const payload: any = { status };
            if (pilotNotes !== undefined) payload.pilot_notes = pilotNotes;
            if (performanceScore !== undefined) payload.performance_score = performanceScore;
            if (flightSummary !== undefined) payload.flight_summary = flightSummary;

            const response = await azureClient.functions.invoke(`missions/${missionId}`, {
                method: 'PATCH',
                body: payload,
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to update mission');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['activeMissions'] });
            queryClient.invalidateQueries({ queryKey: ['missions'] });
            queryClient.invalidateQueries({ queryKey: ['missionReport', variables.missionId] });
            toast.success("Mission archived to career logbook.");
        },
        onError: (error: any) => {
            toast.error(`Failed to update mission: ${error.message}`);
        },
    });

    return {
        updateStatus: updateStatus.mutateAsync,
        isUpdating: updateStatus.isPending,
    };
};
