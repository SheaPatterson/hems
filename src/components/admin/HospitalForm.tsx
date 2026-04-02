import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, HeartPulse } from 'lucide-react';
import { Hospital } from '@/data/hemsData';
import { useHospitalManagement } from '@/hooks/useHospitalManagement';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HospitalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Hospital; 
}

const HospitalForm: React.FC<HospitalFormProps> = ({ open, onOpenChange, initialData }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [faaIdentifier, setFaaIdentifier] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [traumaLevel, setTraumaLevel] = useState<string>('none');

  const { createHospital, updateHospital, isCreating, isUpdating } = useHospitalManagement();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCity(initialData.city);
      setFaaIdentifier(initialData.faaIdentifier || '');
      setLatitude(initialData.latitude);
      setLongitude(initialData.longitude);
      setTraumaLevel(initialData.traumaLevel ? initialData.traumaLevel.toString() : 'none');
    } else {
      setName('');
      setCity('');
      setFaaIdentifier('');
      setLatitude('');
      setLongitude('');
      setTraumaLevel('none');
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !city || latitude === '' || longitude === '') {
      toast.error("Please fill in all required fields.");
      return;
    }

    const data = {
      name,
      city,
      faaIdentifier: faaIdentifier.trim() || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      isTraumaCenter: traumaLevel !== 'none',
      traumaLevel: traumaLevel === 'none' ? null : parseInt(traumaLevel),
    };

    try {
      if (initialData) {
        await updateHospital({ id: initialData.id, data });
        toast.success(`Hospital ${name} updated successfully.`);
      } else {
        await createHospital(data);
        toast.success(`Hospital ${name} created successfully.`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(`Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const title = initialData ? `Edit Hospital: ${initialData.name}` : 'Add New Hospital';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the details and location for the hospital.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hospital Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
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
          
          <div className="space-y-2">
            <Label className="flex items-center">
                <HeartPulse className="w-4 h-4 mr-1 text-red-500" /> Trauma Designation
            </Label>
            <Select value={traumaLevel} onValueChange={setTraumaLevel}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Trauma Level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Not a Trauma Center</SelectItem>
                    <SelectItem value="1">Level 1 Trauma Center</SelectItem>
                    <SelectItem value="2">Level 2 Trauma Center</SelectItem>
                    <SelectItem value="3">Level 3 Trauma Center</SelectItem>
                </SelectContent>
            </Select>
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

export default HospitalForm;