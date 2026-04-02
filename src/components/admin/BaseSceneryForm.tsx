import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { HemsBase } from '@/data/hemsData';
import { BaseScenery, useBaseScenery } from '@/hooks/useBaseScenery';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface BaseSceneryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  base: HemsBase;
  initialData?: BaseScenery;
}

const BaseSceneryForm: React.FC<BaseSceneryFormProps> = ({ open, onOpenChange, base, initialData }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);

  const { upsertScenery, isSaving } = useBaseScenery();
  const [isUploading, setIsUploading] = useState(false);
  const isBusy = isSaving || isUploading;

  useEffect(() => {
    if (initialData) {
      setCurrentImageUrls(initialData.image_urls || []);
      setDescription(initialData.description || '');
    } else {
      setCurrentImageUrls([]);
      setDescription('');
    }
    setFiles([]);
    setManualUrlInput('');
  }, [initialData, open]);

  const uploadFiles = async (filesToUpload: File[]): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of filesToUpload) {
      const fileExtension = file.name.split('.').pop();
      const filePath = `base_scenery/${base.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

      try {
        const { data, error } = await supabase.storage
          .from('scenery-files')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('scenery-files')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
      }
    }
    setIsUploading(false);
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrls = [...currentImageUrls];

    if (files.length > 0) {
      const newUrls = await uploadFiles(files);
      finalImageUrls = [...newUrls, ...finalImageUrls];
    }

    if (manualUrlInput.trim()) {
      finalImageUrls = [manualUrlInput.trim(), ...finalImageUrls];
    }

    if (finalImageUrls.length === 0) {
      toast.error("Please provide at least one image.");
      return;
    }

    try {
      await upsertScenery({
        base_id: base.id,
        image_urls: finalImageUrls,
        description: description,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setCurrentImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl">{initialData ? 'Update' : 'Add'} Scenery: {base.name}</DialogTitle>
          <DialogDescription>
            Manage visual assets and technical notes for this HEMS base.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow px-6">
          <form id="base-scenery-form" onSubmit={handleSubmit} className="space-y-8 pb-6">
            
            {/* 1. Upload Section */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-primary">
                <Upload className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-tight text-sm">Upload New Media</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fileUpload">Choose Photos (Multiple)</Label>
                  <Input 
                    id="fileUpload" 
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                    disabled={isBusy}
                    className="cursor-pointer"
                  />
                  {files.length > 0 && (
                    <p className="text-xs text-green-600 font-medium">{files.length} files staged for upload</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manualUrl">External Image URL</Label>
                  <Input 
                    id="manualUrl" 
                    value={manualUrlInput} 
                    onChange={(e) => setManualUrlInput(e.target.value)} 
                    placeholder="https://example.com/image.jpg"
                    disabled={isBusy}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* 2. Metadata Section */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-primary">
                <ImageIcon className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-tight text-sm">Technical Description</h3>
              </div>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Technical notes for this base (e.g. 'Custom hangar models, winter textures included')"
                rows={3}
                disabled={isBusy}
              />
            </section>

            <Separator />

            {/* 3. Existing Assets Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary">
                  <ImageIcon className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-tight text-sm">Current Asset Library</h3>
                </div>
                <Badge variant="outline">{currentImageUrls.length} Images</Badge>
              </div>

              {currentImageUrls.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No images in library</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentImageUrls.map((url, index) => (
                    <div key={index} className="group relative aspect-video rounded-md overflow-hidden border bg-muted">
                      <img 
                        src={url} 
                        alt={`Scenery ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = '/public/placeholder.svg')}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleRemoveUrl(url)}
                          disabled={isBusy}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </form>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>Cancel</Button>
          <Button form="base-scenery-form" type="submit" disabled={isBusy} className="min-w-[140px]">
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BaseSceneryForm;