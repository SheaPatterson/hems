import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MissionFormProps {
    onStartMission: (mission: any) => void;
    onCancel: () => void;
}

export const MissionForm: React.FC<MissionFormProps> = ({ onStartMission, onCancel }) => {
    // This is a placeholder. The actual mission planning is done on /generate.
    const mockStart = () => {
        onStartMission({ missionId: 'MOCK-001', callsign: 'MOCK42' });
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="text-lg font-bold">Mission Form Placeholder</h4>
            <p className="text-sm text-muted-foreground">Use the main Dispatcher page to create a real mission.</p>
            <div className="flex justify-end space-x-2">
                <Button onClick={onCancel} variant="outline"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                <Button onClick={mockStart} disabled>Start Mock Mission</Button>
            </div>
        </div>
    );
};