import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User as UserIcon, Image as ImageIcon, MapPin, Monitor, Award, Mail } from 'lucide-react';
import { Profile, useProfiles } from '@/hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ open, onOpenChange, profile }) => {
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const { updateProfile, isUpdating } = useProfiles();

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || '',
        location: profile.location || '',
        email_public: profile.email_public || '',
        simulators: profile.simulators || '',
        experience: profile.experience || '',
        bio: profile.bio || '',
        social_links: profile.social_links || {}
      });
    }
  }, [profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedData = {
        ...formData,
        first_name: formData.first_name?.trim() || null,
        last_name: formData.last_name?.trim() || null,
        avatar_url: formData.avatar_url?.trim() || null,
        location: formData.location?.trim() || null,
        email_public: formData.email_public?.trim() || null,
        simulators: formData.simulators?.trim() || null,
        experience: formData.experience?.trim() || null,
        bio: formData.bio?.trim() || null,
    };

    // Clean up social links: remove null/empty strings, default to {} if empty
    const socialLinks = Object.fromEntries(
        Object.entries(formData.social_links || {}).filter(([, value]) => value && typeof value === 'string' && value.trim() !== '')
    );

    try {
      await updateProfile({
        ...cleanedData,
        social_links: Object.keys(socialLinks).length > 0 ? socialLinks : {},
        id: profile.id,
      } as any);
      onOpenChange(false);
    } catch (error) {
      // Handled by hook
    }
  };

  const initials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Administrative Profile Override</DialogTitle>
          <DialogDescription>
            Directly modify professional records for user ID: <span className="font-mono text-xs">{profile.id}</span>
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow px-6">
            <div className="flex justify-center py-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={formData.avatar_url || undefined} />
                    <AvatarFallback className="text-xl bg-muted">{initials || <UserIcon />}</AvatarFallback>
                </Avatar>
            </div>

            <form id="admin-profile-form" onSubmit={handleSubmit} className="grid gap-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={formData.first_name || ''} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={formData.last_name || ''} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Location</Label>
                        <Input value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center"><Award className="w-3 h-3 mr-1" /> Experience</Label>
                        <Input value={formData.experience || ''} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center"><Monitor className="w-3 h-3 mr-1" /> Sim Stack</Label>
                    <Input value={formData.simulators || ''} onChange={(e) => setFormData({...formData, simulators: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> Avatar URL</Label>
                    <Input value={formData.avatar_url || ''} onChange={(e) => setFormData({...formData, avatar_url: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3} />
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Digital Links</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            placeholder="LinkedIn" 
                            value={formData.social_links?.linkedin || ''} 
                            onChange={(e) => setFormData(prev => ({...prev, social_links: {...prev.social_links, linkedin: e.target.value}}))} 
                            className="h-8 text-xs" 
                        />
                        <Input 
                            placeholder="Discord" 
                            value={formData.social_links?.discord || ''} 
                            onChange={(e) => setFormData(prev => ({...prev, social_links: {...prev.social_links, discord: e.target.value}}))} 
                            className="h-8 text-xs" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email_public" className="text-xs flex items-center"><Mail className="w-3 h-3 mr-1" /> Public Contact Email</Label>
                        <Input id="email_public" value={formData.email_public || ''} onChange={(e) => setFormData({...formData, email_public: e.target.value})} placeholder="pilot@example.com" className="text-sm h-8" />
                    </div>
                </div>
            </form>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-muted/20">
          <Button type="submit" form="admin-profile-form" disabled={isUpdating} className="w-full">
            {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Personnel Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileForm;