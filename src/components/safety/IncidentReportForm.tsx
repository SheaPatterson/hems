import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldAlert, FileWarning, ClipboardCheck } from 'lucide-react';
import { useIncidentReports, IncidentReport } from '@/hooks/useIncidentReports';
import { useAuth } from '@/components/AuthGuard';

interface IncidentReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMissionId?: string;
}

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({ open, onOpenChange, defaultMissionId }) => {
  const { user } = useAuth();
  const { fileReport, isSubmitting } = useIncidentReports();

  const [missionId, setMissionId] = useState(defaultMissionId || '');
  const [type, setType] = useState<IncidentReport['report_type']>('Operational');
  const [severity, setSeverity] = useState<IncidentReport['severity']>('Low');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await fileReport({
        user_id: user.id,
        mission_id: missionId || 'NON-MISSION',
        report_type: type,
        severity: severity,
        description: description,
        actions_taken: actions || null,
      });
      onOpenChange(false);
      // Reset form
      setMissionId('');
      setDescription('');
      setActions('');
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <ShieldAlert className="w-5 h-5 mr-2" /> Safety Incident Reporting
          </DialogTitle>
          <DialogDescription>
            Document operational hazards, maintenance issues, or safety violations. All reports are encrypted and sent to Flight Ops.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="missionId">Mission ID (Optional)</Label>
              <Input 
                id="missionId" 
                placeholder="e.g. HEMS-123456" 
                value={missionId} 
                onChange={(e) => setMissionId(e.target.value.toUpperCase())} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Incident Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Weather">Weather</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Risk Severity</Label>
            <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
              <SelectTrigger id="severity" className={
                severity === 'Critical' ? 'border-destructive text-destructive font-bold' : 
                severity === 'High' ? 'border-orange-500 text-orange-600 font-bold' : ''
              }>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low - Minimal Operational Impact</SelectItem>
                <SelectItem value="Medium">Medium - Noteworthy Hazard</SelectItem>
                <SelectItem value="High">High - Serious Safety Concern</SelectItem>
                <SelectItem value="Critical">Critical - Immediate Threat / Accident</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center"><FileWarning className="w-3 h-3 mr-1" /> Incident Description</Label>
            <Textarea 
              id="description" 
              placeholder="Provide a detailed account of what occurred..." 
              rows={4} 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actions" className="flex items-center"><ClipboardCheck className="w-3 h-3 mr-1" /> Corrective Actions Taken</Label>
            <Textarea 
              id="actions" 
              placeholder="What steps were taken to mitigate the risk?" 
              rows={2}
              value={actions}
              onChange={(e) => setActions(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
              File Official Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentReportForm;