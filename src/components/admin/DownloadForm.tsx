import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Download, Tag, Upload, File as FileIcon, X } from 'lucide-react';
import { DownloadItem, useDownloads } from '@/hooks/useDownloads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DownloadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DownloadItem; 
}

const CATEGORIES = [
    'Checklists', 
    'Manuals', 
    'Simulator Plugins', 
    'Operational Video', 
    'Audio/Radio Training',
    'Scenery Package',
    'Other'
];

const DownloadForm: React.FC<DownloadFormProps> = ({ open, onOpenChange, initialData }) => {
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { upsertDownload, isSaving } = useDownloads();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setFileUrl(initialData.file_url);
      setDescription(initialData.description || '');
      setCategory(initialData.category);
    } else {
      setTitle('');
      setFileUrl('');
      setDescription('');
      setCategory(CATEGORIES[0]);
    }
    setUploadFile(null);
  }, [initialData, open]);

  const handleFileUpload = async () => {
    if (!uploadFile) return fileUrl;
    
    setIsUploading(true);
    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `assets/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('operational-assets')
        .upload(filePath, uploadFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('operational-assets')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || (!fileUrl.trim() && !uploadFile) || !category) {
      toast.error("Title, Category, and either a File or URL are required.");
      return;
    }

    let finalUrl = fileUrl;
    if (uploadFile) {
        const uploadedUrl = await handleFileUpload();
        if (!uploadedUrl) return; // Stop if upload failed
        finalUrl = uploadedUrl;
    }

    const data = {
      id: initialData?.id,
      title,
      file_url: finalUrl,
      description: description.trim() || null,
      category,
    };

    try {
      await upsertDownload(data);
      onOpenChange(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const dialogTitle = initialData ? `Edit Download: ${initialData.title}` : 'Add New Asset';
  const isBusy = isSaving || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Provide an external link or upload a file for the HEMS community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Asset Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isBusy} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center">
                <Tag className="w-4 h-4 mr-1 text-muted-foreground" /> Category
            </Label>
            <Select value={category} onValueChange={setCategory} disabled={isBusy}>
                <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
                <Label className="flex items-center">
                    <Upload className="w-4 h-4 mr-1 text-primary" /> Direct File Upload
                </Label>
                {uploadFile ? (
                    <div className="flex items-center justify-between p-2 bg-background border rounded-md">
                        <div className="flex items-center space-x-2 truncate">
                            <FileIcon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-mono truncate">{uploadFile.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setUploadFile(null)}>
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                ) : (
                    <Input 
                        type="file" 
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="cursor-pointer text-xs"
                        disabled={isBusy}
                    />
                )}
                <p className="text-[10px] text-muted-foreground italic">Preferred for documents, audio, or training clips.</p>
            </div>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-muted px-2 text-muted-foreground">OR</span></div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="fileUrl" className="flex items-center">
                    <Download className="w-4 h-4 mr-1 text-muted-foreground" /> External Resource URL
                </Label>
                <Input 
                    id="fileUrl" 
                    value={fileUrl} 
                    onChange={(e) => setFileUrl(e.target.value)} 
                    placeholder="https://storage.example.com/manual.pdf"
                    disabled={isBusy || !!uploadFile}
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Technical Description (Optional)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              disabled={isBusy}
              placeholder="e.g., 'Requires X-Plane 12', 'Revised emergency checklists'"
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isBusy}>
              {isBusy ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUploading ? 'Uploading Media...' : 'Saving...'}
                </>
              ) : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    Publish Asset
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadForm;