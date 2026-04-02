import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MissionReport } from '@/data/hemsData';
import { initXPlaneConnection, getTelemetry } from '@/plugins/xplane/xplaneWebApi';
import { determineFlightPhase } from '@/plugins/xplane/utils';
import { sendTelemetryUpdate } from '@/integrations/simulator/api';
import { sendCrewMessageToAgent, fetchDispatchAudio } from '@/integrations/dispatch/api';

const TELEMETRY_INTERVAL_MS = 4000; // Reverting to stable 4s interval

export const useSimulatorPlugin = () => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('hems_api_key') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('hems_api_key'));
    
    const [missions, setMissions] = useState<MissionReport[]>([]);
    const [selectedMission, setSelectedMission] = useState<MissionReport | null>(null);
    const [isLoadingMissions, setIsLoadingMissions] = useState(false);
    
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [consoleOutput, setConsoleOutput] = useState<string[]>(["[SYS] BOOT_SEQUENCE_COMPLETE"]);
    const telemetryInterval = useRef<number | null>(null);
    const lastReachedWaypointIndex = useRef(0);

    const addToConsole = useCallback((msg: string) => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        setConsoleOutput(prev => [...prev.slice(-50), `[${timestamp}] ${msg}`]);
    }, []);

    const triggerProactiveCall = async (missionId: string, eventCode: string) => {
        const response = await sendCrewMessageToAgent(missionId, eventCode);
        if (response) {
            const audioUrl = await fetchDispatchAudio(response.responseText);
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                audio.play();
            }
        }
    };

    const handleAuth = () => {
        if (apiKey.length < 10) return;
        localStorage.setItem('hems_api_key', apiKey);
        setIsAuthenticated(true);
        addToConsole("LINK_ESTABLISHED: HEMS_GATEWAY_v5.2");
        toast.success("Tactical Link Authenticated.");
    };

    const connectToSimulator = async (host: string, port: number) => {
        setIsConnecting(true);
        addToConsole(`INIT_HANDSHAKE: ${host}:${port}`);
        const success = await initXPlaneConnection(host, port);
        setIsConnected(success);
        setIsConnecting(false);
        if (success) {
            addToConsole("UPLINK_ESTABLISHED: X-PLANE_WEB_API");
        }
    };

    const loadMissions = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoadingMissions(true);
        const { data } = await supabase.from('missions').select('*').eq('status', 'active').order('created_at', { ascending: false });
        if (data) {
            const mappedMissions = data.map((m: any) => ({ ...m, missionId: m.mission_id })) as any;
            setMissions(mappedMissions);
            if (mappedMissions.length > 0 && !selectedMission) setSelectedMission(mappedMissions[0]);
        }
        setIsLoadingMissions(false);
    }, [isAuthenticated, selectedMission]);

    const startSync = () => {
        if (!selectedMission || !isConnected || isSyncing) return;
        setIsSyncing(true);
        addToConsole("SUPABASE_REALTIME_SYNC: ENGAGED");

        lastReachedWaypointIndex.current = 0;

        const mainLoop = async () => {
            try {
                const telemetry = await getTelemetry();
                const { newIndex, phase } = determineFlightPhase(telemetry.latitude, telemetry.longitude, selectedMission.waypoints, lastReachedWaypointIndex.current);
                
                if (newIndex > lastReachedWaypointIndex.current) {
                    const wp = selectedMission.waypoints[newIndex];
                    addToConsole(`AUTO_DISPATCH: Reached ${wp.name}`);
                    triggerProactiveCall(selectedMission.missionId, `EVENT_WAYPOINT_REACHED:${wp.name}`);
                }
                
                lastReachedWaypointIndex.current = newIndex;

                const payload = {
                    ...telemetry,
                    mission_id: selectedMission.missionId,
                    phase,
                    timeEnrouteMinutes: (selectedMission.tracking.timeEnrouteMinutes || 0) + (TELEMETRY_INTERVAL_MS / 60000),
                };

                // Supabase Edge Function Update
                const success = await sendTelemetryUpdate(payload);
                if (success) {
                    addToConsole(`TX_PACKET [SUPABASE]: ${phase} | ${telemetry.fuelRemainingLbs}lbs`);
                }
            } catch (e) {
                stopSync();
            }
        };

        telemetryInterval.current = setInterval(mainLoop, TELEMETRY_INTERVAL_MS) as any;
    };

    const stopSync = () => {
        if (telemetryInterval.current) clearInterval(telemetryInterval.current);
        setIsSyncing(false);
        addToConsole("SUPABASE_REALTIME_SYNC: DISENGAGED");
    };

    useEffect(() => {
        if (isAuthenticated) loadMissions();
    }, [isAuthenticated, loadMissions]);

    return {
        apiKey, setApiKey, isAuthenticated, handleAuth,
        missions, selectedMission, setSelectedMission, isLoadingMissions, loadMissions,
        isConnected, isConnecting, connectToSimulator,
        isSyncing, startSync, stopSync,
        consoleOutput,
    };
};