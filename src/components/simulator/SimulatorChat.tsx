import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Info } from 'lucide-react';
import DispatcherChat from '@/components/DispatcherChat';
import { MissionReport } from '@/data/hemsData';

interface SimulatorChatProps {
    mission: MissionReport | null;
}

const SimulatorChat: React.FC<SimulatorChatProps> = ({ mission }) => {
    if (!mission) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="p-3 border-b">
                    <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" /> AI Dispatcher Comms
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-6 flex items-center justify-center text-muted-foreground text-center">
                    <div className="space-y-2">
                        <Info className="w-6 h-6 mx-auto" />
                        <p>Select an active mission to initiate communication with the AI Dispatch Agent.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <DispatcherChat missionReport={mission} />;
};

export default SimulatorChat;