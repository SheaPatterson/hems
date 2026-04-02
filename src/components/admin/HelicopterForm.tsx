import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Upload, X, Image as ImageIcon, Wrench } from 'lucide-react';
import { Helicopter } from '@/data/hemsData';
import { useHelicopterManagement } from '@/hooks/useHelicopterManagement';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HelicopterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Helicopter;
}

const HelicopterForm: React.FC<HelicopterFormProps> = ({ open, onOpenChange, initialData }) => {
  const [model, setModel] = useState('');
  const [registration, setRegistration] = useState('');
  const [fuelCapacityLbs, setFuelCapacityLbs] = useState<number | ''>('');
  const [cruiseSpeedKts, setCruiseSpeedKts] = useState<number | ''>('');
  const [fuelBurnRateLbHr, setFuelBurnRateLbHr] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState<'FMC' | 'AOG'>('FMC');
  const [isUploading, setIsUploading] = useState(false);

  const { createHelicopter, updateHelicopter, isCreating, isUpdating } = useHelicopterManagement();
  const isSaving = isCreating || isUpdating || isUploading;

  useEffect(() => {
    if (initialData) {
      setModel(initialData.model);
      setRegistration(initialData.registration);
      setFuelCapacityLbs(initialData.fuelCapacityLbs);
      setCruiseSpeedKts(initialData.cruiseSpeedKts);
      setFuelBurnRateLbHr(initialData.fuelBurnRateLbHr);
      setImageUrl(initialData.imageUrl || null);
      setMaintenanceStatus(initialData.maintenanceStatus || 'FMC');
    } else {
      setModel('');
      setRegistration('');
      setFuelCapacityLbs('');
      setCruiseSpeedKts('');
      setFuelBurnRateLbHr('');
      setImageUrl(null);
      setMaintenanceStatus('FMC');
    }
  }, [initialData, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `helicopters/${registration || 'unknown'}-${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('scenery-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('scenery-files')
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
      toast.success("Photo uploaded successfully.");
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!model || !registration || fuelCapacityLbs === '' || cruiseSpeedKts === '' || fuelBurnRateLbHr === '') {
      toast.error("Please fill in all required fields.");
      return;
    }

    const data = {
      model,
      registration,
      fuelCapacityLbs: Number(fuelCapacityLbs),
      cruiseSpeedKts: Number(cruiseSpeedKts),
      fuelBurnRateLbHr: Number(fuelBurnRateLbHr),
      imageUrl,
      maintenanceStatus,
    };

    try {
      if (initialData) {
        await updateHelicopter({ id: initialData.id, data });
        toast.success(`Helicopter ${registration} updated successfully.`);
      } else {
        await createHelicopter(data);
        toast.success(`Helicopter ${registration} created successfully.`);
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    }
  };

  const title = initialData ? `Edit Helicopter: ${initialData.registration}` : 'Add New Helicopter';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the specifications and upload a photo of the aircraft.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Aircraft Photo</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-muted/30">
              {imageUrl ? (
                <div className="relative aspect-video w-full rounded-md overflow-hidden bg-black">
                  <img src={imageUrl} alt="Aircraft" className="w-full h-full object-contain" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8" 
                    onClick={() => setImageUrl(null)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                  <div className="flex items-center justify-center">
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Upload Photo</span>
                      </div>
                      <Input 
                        id="photo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={isSaving || !registration}
                      />
                    </Label>
                  </div>
                  {!registration && <p className="text-[10px] text-destructive">Enter Registration first to enable upload</p>}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} required disabled={isSaving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration">Registration (Tail Number)</Label>
            <Input id="registration" value={registration} onChange={(e) => setRegistration(e.target.value.toUpperCase())} required disabled={isSaving} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuelCapacity">Fuel (Lbs)</Label>
              <Input 
                id="fuelCapacity" 
                type="number" 
                value={fuelCapacityLbs} 
                onChange={(e) => setFuelCapacityLbs(e.target.value === '' ? '' : Number(e.target.value))} 
                required 
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cruiseSpeed">Cruise (Kts)</Label>
              <Input 
                id="cruiseSpeed" 
                type="number" 
                value={cruiseSpeedKts} 
                onChange={(e) => setCruiseSpeedKts(e.target.value === '' ? '' : Number(e.target.value))} 
                required 
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelBurnRate">Fuel Burn Rate (Lbs/Hr)</Label>
            <Input 
              id="fuelBurnRate" 
              type="number" 
              value={fuelBurnRateLbHr} 
              onChange={(e) => setFuelBurnRateLbHr(e.target.value === '' ? '' : Number(e.target.value))} 
              required 
              disabled={isSaving}
            />
          </div>
          
          {/* Maintenance Status */}
          <div className="space-y-2">
            <Label htmlFor="maintenanceStatus" className="flex items-center">
                <Wrench className="w-4 h-4 mr-1 text-muted-foreground" /> Maintenance Status
            </Label>
            <Select
                value={maintenanceStatus}
                onValueChange={(value: 'FMC' | 'AOG') => setMaintenanceStatus(value)}
                disabled={isSaving}
            >
                <SelectTrigger id="maintenanceStatus">
                    <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="FMC">FMC (Fully Mission Capable)</SelectItem>
                    <SelectItem value="AOG">AOG (Aircraft On Ground)</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && !isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Aircraft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HelicopterForm;