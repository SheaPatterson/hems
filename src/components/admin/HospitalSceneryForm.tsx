import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Upload, X, Image as ImageIcon, FileArchive } from 'lucide-react';
import { Hospital } from '@/data/hemsData';
import { HospitalScenery, useHospitalScenery } from '@/hooks/useHospitalScenery';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface HospitalSceneryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital: Hospital;
  initialData?: HospitalScenery;
}

const HospitalSceneryForm: React.FC<HospitalSceneryFormProps> = ({ open, onOpenChange, hospital, initialData }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [currentZipUrl, setCurrentZipUrl] = useState<string | null>(null);

  const { upsertScenery, isSaving } = useHospitalScenery();
  const [isUploading, setIsUploading] = useState(false);
  const isBusy = isSaving || isUploading;

  useEffect(() => {
    if (initialData) {
      setCurrentImageUrls(initialData.image_urls || []);
      setDescription(initialData.description || '');
      setCurrentZipUrl(initialData.zip_url || null);
    } else {
      setCurrentImageUrls([]);
      setDescription('');
      setCurrentZipUrl(null);
    }
    setFiles([]);
    setZipFile(null);
  }, [initialData, open]);

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExtension = file.name.split('.').pop();
    const filePath = `${folder}/${hospital.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    try {
      const { data, error } = await supabase.storage
        .from('scenery-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('scenery-files')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalImageUrls = [...currentImageUrls];
    let finalZipUrl = currentZipUrl;

    // Handle Gallery Uploads
    if (files.length > 0) {
      for (const file of files) {
        const url = await uploadFile(file, 'hospital_images');
        if (url) finalImageUrls = [url, ...finalImageUrls];
      }
    }

    // Handle ZIP Upload
    if (zipFile) {
      const url = await uploadFile(zipFile, 'hospital_packages');
      if (url) finalZipUrl = url;
    }

    try {
      await upsertScenery({
        hospital_id: hospital.id,
        image_urls: finalImageUrls,
        description: description,
        zip_url: finalZipUrl,
      });
      onOpenChange(false);
    } catch (error) {
      // Handled by hook
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-primary/5">
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
            <ImageIcon className="w-8 h-8 inline mr-2 text-primary" /> Visual Asset Uplink
          </DialogTitle>
          <DialogDescription className="text-base">Managing regional facility: <span className="font-bold text-foreground">{hospital.name}</span></DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow px-8">
          <form id="scenery-form" onSubmit={handleSubmit} className="space-y-8 pb-10 pt-4">
            
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-primary">
                <FileArchive className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Scenery Package (ZIP)</h3>
              </div>
              <div className="p-6 border-2 border-dashed rounded-2xl bg-muted/20 space-y-4">
                {currentZipUrl && (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-green-700">
                            <FileArchive className="w-4 h-4" />
                            <span>ACTIVE_PACKAGE_DETECTED.ZIP</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentZipUrl(null)} className="h-7 text-[10px] font-black uppercase text-destructive hover:bg-destructive/10">DELETE ASSET</Button>
                    </div>
                )}
                <Input 
                    type="file" 
                    accept=".zip,.rar,.7z" 
                    onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                    disabled={isBusy}
                    className="cursor-pointer h-12 pt-2.5"
                />
                <p className="text-[10px] text-muted-foreground italic px-2">Uplinked ZIP packages are distributed via the Pilot Resource Center.</p>
              </div>
            </section>

            <Separator className="opacity-40" />

            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-primary">
                <Upload className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">LZ Briefing Photos</h3>
              </div>
              <Input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                disabled={isBusy}
                className="cursor-pointer h-12 pt-2.5"
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-primary">
                <ImageIcon className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Operational Briefing</h3>
              </div>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Technical notes regarding obstacles, lighting, or frequency requirements..."
                rows={4}
                disabled={isBusy}
                className="rounded-xl border-2 focus-visible:ring-primary text-sm"
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Current Image Library</h3>
                <Badge variant="outline" className="font-mono">{currentImageUrls.length} ASSETS</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {currentImageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border-2 group shadow-sm">
                    <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => setCurrentImageUrls(prev => prev.filter(u => u !== url))}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </form>
        </ScrollArea>

        <DialogFooter className="p-8 border-t bg-primary/5">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy} className="h-12 px-8 font-bold">CANCEL</Button>
          <Button form="scenery-form" type="submit" disabled={isBusy} className="h-12 px-10 font-black italic shadow-xl">
            {isBusy ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    TRANSMITTING ASSETS...
                </>
            ) : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    SYNC TO DATA CENTER
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalSceneryForm;