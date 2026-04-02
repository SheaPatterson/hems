import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Phone, PlaneTakeoff } from 'lucide-react';
import { HemsBase } from '@/data/hemsData';
import { useHemsBaseManagement } from '@/hooks/useHemsBaseManagement';
import { toast } from 'sonner';
import { useHemsData } from '@/hooks/useHemsData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HemsBaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: HemsBase; // Optional data for editing
}

const HemsBaseForm: React.FC<HemsBaseFormProps> = ({ open, onOpenChange, initialData }) => {
  const { helicopters, isLoading: isHelicoptersLoading } = useHemsData();
    
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [faaIdentifier, setFaaIdentifier] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [assignedHelicopterId, setAssignedHelicopterId] = useState<string | null>(null);

  const { createHemsBase, updateHemsBase, isCreating, isUpdating } = useHemsBaseManagement();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLocation(initialData.location);
      setContact(initialData.contact || '');
      setFaaIdentifier(initialData.faaIdentifier || '');
      setLatitude(initialData.latitude);
      setLongitude(initialData.longitude);
      setAssignedHelicopterId(initialData.helicopterId); // Use helicopterId
    } else {
      // Reset form for creation
      setName('');
      setLocation('');
      setContact('');
      setFaaIdentifier('');
      setLatitude('');
      setLongitude('');
      setAssignedHelicopterId(null);
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !location || latitude === '' || longitude === '') {
      toast.error("Please fill in all required fields (Name, Location, Lat, Lon).");
      return;
    }

    const data = {
      name,
      location,
      contact: contact.trim() || null,
      faaIdentifier: faaIdentifier.trim() || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      helicopterId: assignedHelicopterId,
    };

    try {
      if (initialData) {
        await updateHemsBase({ id: initialData.id, data });
        toast.success(`HEMS Base ${name} updated successfully.`);
      } else {
        await createHemsBase(data);
        toast.success(`HEMS Base ${name} created successfully.`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(`Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const title = initialData ? `Edit HEMS Base: ${initialData.name}` : 'Add New HEMS Base';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the operational details and location for the HEMS base.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Base Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location/City</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faaIdentifier">FAA Identifier (Optional)</Label>
              <Input 
                id="faaIdentifier" 
                value={faaIdentifier} 
                onChange={(e) => setFaaIdentifier(e.target.value.toUpperCase())} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact" className="flex items-center">
                <Phone className="w-4 h-4 mr-1 text-muted-foreground" /> Contact Number (Optional)
            </Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          
          {/* NEW: Helicopter Assignment */}
          <div className="space-y-2">
            <Label htmlFor="helicopterAssignment" className="flex items-center">
                <PlaneTakeoff className="w-4 h-4 mr-1 text-muted-foreground" /> Assigned Helicopter (Optional)
            </Label>
            <Select
                value={assignedHelicopterId || 'unassigned'}
                onValueChange={(value) => setAssignedHelicopterId(value === 'unassigned' ? null : value)}
                disabled={isHelicoptersLoading}
            >
                <SelectTrigger id="helicopterAssignment">
                    <SelectValue placeholder="Select Assigned Helicopter" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                    {helicopters.map(h => (
                        <SelectItem key={h.id} value={h.id}>
                            {h.registration} ({h.model})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {isHelicoptersLoading && <p className="text-xs text-muted-foreground">Loading helicopters...</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input 
                id="latitude" 
                type="number" 
                step="any"
                value={latitude} 
                onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input 
                id="longitude" 
                type="number" 
                step="any"
                value={longitude} 
                onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))} 
                required 
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HemsBaseForm;