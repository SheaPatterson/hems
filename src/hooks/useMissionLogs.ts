import { useState, useEffect, useCallback } from 'react';
import { azureClient } from '@/integrations/azure/client';
import { signalrManager } from '@/integrations/azure/realtime';
import { toast } from 'sonner';

export interface LogEntry {
    id: string;
    sender: 'Dispatcher' | 'Crew' | 'System';
    message: string;
    timestamp: string;
    callsign?: string;
    user_id?: string;
}

export const useMissionLogs = (missionId?: string, isGlobal: boolean = false) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isGlobal) {
                const response = await azureClient.functions.invoke('global-dispatch-logs', { method: 'GET' });
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data || []);
                }
            } else if (missionId) {
                const response = await azureClient.functions.invoke(`mission-logs/${missionId}`, { method: 'GET' });
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data || []);
                }
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        }
        setIsLoading(false);
    }, [missionId, isGlobal]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    useEffect(() => {
        const groupName = isGlobal ? 'global-dispatch' : `mission-radio:${missionId}`;
        const eventName = isGlobal ? 'newDispatchLog' : 'newRadioLog';

        if (!isGlobal && !missionId) return;

        const handleNewLog = (payload: unknown) => {
            const newLog = payload as LogEntry;
            setLogs(prev => {
                if (prev.some(log => log.id === newLog.id)) return prev;
                return [...prev, newLog];
            });
        };

        signalrManager.joinGroup(groupName);
        signalrManager.on<LogEntry>(eventName, handleNewLog);

        return () => {
            signalrManager.off(eventName);
            signalrManager.leaveGroup(groupName);
        };
    }, [missionId, isGlobal]);

    const addLog = async (sender: LogEntry['sender'], message: string, callsign?: string) => {
        const session = await azureClient.auth.getSession();
        if (!session?.user) return;

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const newLog: LogEntry = {
            id: tempId,
            sender,
            message,
            timestamp: new Date().toISOString(),
            callsign,
            user_id: session.user.id,
        };
        setLogs(prev => [...prev, newLog]);

        const endpoint = isGlobal ? 'global-dispatch-logs' : 'mission-logs';
        const payload: any = { sender, message, user_id: session.user.id, callsign };
        if (!isGlobal && missionId) {
            payload.mission_id = missionId;
        }

        const response = await azureClient.functions.invoke(endpoint, {
            method: 'POST',
            body: payload,
        });

        if (!response.ok) {
            // Revert optimistic update on failure
            setLogs(prev => prev.filter(log => log.id !== tempId));
            toast.error("Failed to send message.");
        }
    };

    return { logs, isLoading, addLog };
};
