import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TelemetryData, BridgeStatus } from '@/types/bridge';
import { HistoricalMission } from './useMissions';

const LOCAL_BRIDGE_URL = 'http://localhost:8080';
const POLLING_INTERVAL_MS = 1000;

interface BridgeData {
    telemetry: TelemetryData | null;
    status: BridgeStatus | null;
    mission: HistoricalMission | null;
}

export const useLocalBridge = () => {
    const [data, setData] = useState<BridgeData>({ telemetry: null, status: null, mission: null });
    const [isPolling, setIsPolling] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('hems_api_key') || '');

    const fetchMissionContext = useCallback(async (key: string) => {
        if (!key) return;
        try {
            const res = await fetch(`${LOCAL_BRIDGE_URL}/api/mission-context`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: key }),
            });

            if (!res.ok) throw new Error("Failed to fetch mission context.");
            
            const json = await res.json();
            
            if (json.missions && json.missions.length > 0) {
                // Assuming the bridge only cares about the latest active mission
                setData(prev => ({ ...prev, mission: json.missions[0] }));
            } else {
                setData(prev => ({ ...prev, mission: null }));
            }
            setIsAuthenticated(true);
        } catch (e) {
            console.error("Mission context fetch failed:", e);
            setIsAuthenticated(false);
            setData(prev => ({ ...prev, mission: null }));
            toast.error("Failed to sync with HEMS Cloud. Check API Key.");
        }
    }, []);

    const handleAuth = () => {
        if (apiKey.length < 10) {
            toast.error("Invalid API Key length.");
            return;
        }
        localStorage.setItem('hems_api_key', apiKey);
        fetchMissionContext(apiKey);
    };

    // Function to send telemetry via local proxy
    const sendTelemetryRelay = useCallback(async (missionId: string, telemetry: any) => {
        if (!apiKey) return false;
        try {
            const res = await fetch(`${LOCAL_BRIDGE_URL}/api/telemetry-relay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, mission_id: missionId, ...telemetry }),
            });
            if (!res.ok) throw new Error(await res.text());
            return true;
        } catch (e) {
            console.error("Telemetry relay failed:", e);
            toast.error("Telemetry uplink failed via local bridge.");
            return false;
        }
    }, [apiKey]);

    // Function to send chat via local proxy
    const sendChatRelay = useCallback(async (missionId: string, message: string) => {
        if (!apiKey) return null;
        try {
            const res = await fetch(`${LOCAL_BRIDGE_URL}/api/chat-relay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, mission_id: missionId, crew_message: message }),
            });
            if (!res.ok) throw new Error("Chat relay failed.");
            return await res.json();
        } catch (e) {
            console.error("Chat relay failed:", e);
            toast.error("Radio transmission failed.");
            return null;
        }
    }, [apiKey]);


    // 1. Local Bridge Polling (Telemetry & Status)
    useEffect(() => {
        const pollLocal = async () => {
            try {
                const res = await fetch(`${LOCAL_BRIDGE_URL}/api/status`);
                const json = await res.json();
                setData(prev => ({ 
                    ...prev, 
                    telemetry: json.telemetry, 
                    status: { 
                        ...json.status, 
                        cloudConnected: isAuthenticated // Use local auth status for cloud check
                    } 
                }));
                setIsPolling(false);
            } catch (e) {
                setData(prev => ({ ...prev, telemetry: null, status: { simConnected: false, cloudConnected: isAuthenticated, activeMissionId: null, lastPacketReceived: 0 } }));
                setIsPolling(false);
            }
        };
        
        // Initial check and continuous polling
        pollLocal();
        const interval = setInterval(pollLocal, POLLING_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // 2. Initial Cloud Context Fetch
    useEffect(() => {
        if (apiKey) {
            fetchMissionContext(apiKey);
        }
    }, [apiKey, fetchMissionContext]);

    return {
        ...data,
        isPolling,
        apiKey,
        setApiKey,
        isAuthenticated,
        handleAuth,
        fetchMissionContext,
        sendTelemetryRelay,
        sendChatRelay,
    };
};