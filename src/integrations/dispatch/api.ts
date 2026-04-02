import { azureClient } from '@/integrations/azure/client';

export const callTacticalAnalyst = async (mode: 'GENERATE_SCENARIO' | 'REVIEW_FLIGHT', context: any) => {
    try {
        const response = await azureClient.functions.invoke('tactical-analyst', {
            method: 'POST',
            body: { mode, context },
        });

        if (!response.ok) throw new Error("AI Uplink Failed");
        return await response.json();
    } catch (error) {
        console.error("AI Analyst Error:", error);
        return null;
    }
};

export const sendCrewMessageToAgent = async (missionId: string, message: string, apiKey?: string): Promise<{ responseText: string } | null> => {
    try {
        if (apiKey) {
            // For bridge/simulator with API key — call directly with custom header
            const session = await azureClient.auth.getSession();
            const response = await azureClient.functions.invoke('dispatch-agent', {
                method: 'POST',
                body: { mission_id: missionId, crew_message: message },
            });

            if (!response.ok) throw new Error("Agent Offline");
            const data = await response.json();
            return { responseText: data.response_text as string };
        }

        const response = await azureClient.functions.invoke('dispatch-agent', {
            method: 'POST',
            body: { mission_id: missionId, crew_message: message },
        });

        if (!response.ok) throw new Error("Agent Offline");
        const data = await response.json();
        return { responseText: data.response_text as string };
    } catch (error) {
        return null;
    }
};

export const fetchDispatchAudio = async (text: string): Promise<string | null> => {
    try {
        const response = await azureClient.functions.invoke('generate-tts-audio', {
            method: 'POST',
            body: { text },
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.audio_url as string;
    } catch (error) {
        return null;
    }
};
