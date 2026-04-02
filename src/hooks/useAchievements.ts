import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';

export interface Achievement {
    id: string;
    user_id: string;
    type: string;
    awarded_at: string;
}

export const ACHIEVEMENT_TYPES = {
    FIRST_FLIGHT: { label: "First Dispatch", icon: "Zap", color: "bg-blue-500", desc: "Successfully completed first mission." },
    TRAUMA_SPEC: { label: "Trauma Specialist", icon: "HeartPulse", color: "bg-red-600", desc: "Completed 10 Scene Call missions." },
    NIGHT_OWL: { label: "Night Vision", icon: "Moon", color: "bg-indigo-700", desc: "Completed 5 missions during night cycles." },
    COMMANDER: { label: "Flight Command", icon: "ShieldCheck", color: "bg-primary", desc: "Reached the rank of Captain." },
    IRON_AIRFRAME: { label: "Iron Airframe", icon: "Wrench", color: "bg-slate-600", desc: "Completed a mission with a technical discrepancy." },
};

const fetchAchievements = async (userId?: string): Promise<Achievement[]> => {
    const endpoint = userId ? `achievements/${userId}` : 'achievements';
    const response = await azureClient.functions.invoke(endpoint, { method: 'GET' });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch achievements');
    }
    return await response.json() as Achievement[];
};

export const useAchievements = (userId?: string) => {
    const queryClient = useQueryClient();

    const { data: achievements = [], isLoading } = useQuery({
        queryKey: ['achievements', userId],
        queryFn: () => fetchAchievements(userId),
    });

    const awardAchievement = useMutation({
        mutationFn: async (type: string) => {
            const session = await azureClient.auth.getSession();
            if (!session) throw new Error("No session");

            const response = await azureClient.functions.invoke('achievements', {
                method: 'POST',
                body: {
                    user_id: session.user.id,
                    type,
                },
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to award achievement');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['achievements'] });
            toast.success("New Achievement Unlocked!");
        }
    });

    return { achievements, isLoading, awardAchievement: awardAchievement.mutateAsync };
};
