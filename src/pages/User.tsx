import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/components/AuthGuard';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, User as UserIcon, Mail, Image, Key, MapPin, Monitor, Award, Globe, Linkedin, MessageCircle, Eye, EyeOff, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SubscriptionManager from '@/components/SubscriptionManager';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementBadge from '@/components/AchievementBadge';
import { Separator } from '@/components/ui/separator';

const UserProfilePage = () => {
  const { user } = useAuth();
  const { profile, isLoading, isUpdating, updateProfile, rotateApiKey, isRotatingKey } = useProfileManagement();
  const { achievements, isLoading: isAchLoading } = useAchievements(user?.id);

  const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      avatar_url: '',
      location: '',
      email_public: '',
      simulators: '',
      experience: '',
      bio: '',
      social_links: {
          linkedin: '',
          discord: '',
          website: ''
      }
  });
  const [showApiKey, setShowApiKey] = useState(false);

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
        social_links: {
          linkedin: profile.social_links?.linkedin || '',
          discord: profile.social_links?.discord || '',
          website: profile.social_links?.website || ''
        }
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await updateProfile(formData);
  };

  const handleRotateKey = async () => {
      if (!user) return;
      if (!confirm("Are you sure? This will disconnect your active simulator sessions.")) return;
      await rotateApiKey();
  };

  const initials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '');
  const apiKey = profile?.api_key || 'LOGIN_TO_VIEW_KEY';
  const maskedApiKey = apiKey.length > 8 ? '••••••••••••••••••••••••••••••••' : apiKey;

  if (isLoading) return <div className="container mx-auto p-4 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
            <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl transition-transform group-hover:scale-105">
                    <AvatarImage src={formData.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-black">{initials || <UserIcon />}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg border-4 border-background">
                    <UserIcon className="w-4 h-4" />
                </div>
            </div>
            <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">{formData.first_name} {formData.last_name}</h1>
                <p className="text-muted-foreground font-mono text-sm mt-1">{user?.email}</p>
            </div>
        </div>
        <div className="bg-muted p-4 rounded-xl border flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                    <Key className="w-3 h-3 mr-1" /> Simulator API Key
                </Label>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setShowApiKey(!showApiKey)} variant="ghost" className="h-5 text-[10px] px-2 uppercase hover:text-primary">
                        {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button onClick={handleRotateKey} variant="ghost" className="h-5 text-[10px] px-2 uppercase hover:text-destructive" disabled={isRotatingKey}>Rotate</Button>
                </div>
            </div>
            <p className="font-mono text-xs text-primary truncate max-w-[180px]">
                {showApiKey ? apiKey : maskedApiKey}
            </p>
        </div>
      </header>

      {/* NEW: Achievement Medals Strip */}
      <Card className="bg-primary/5 border-2 border-primary/20 rounded-[2rem] shadow-inner overflow-hidden">
          <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                  <Medal className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/80">Operational Achievements</h3>
                  <Separator className="flex-grow opacity-20" />
              </div>
              <div className="flex flex-wrap gap-4">
                  {isAchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                   achievements.length === 0 ? <p className="text-[10px] font-bold text-muted-foreground italic uppercase">No operational medals awarded yet.</p> :
                   achievements.map(a => <AchievementBadge key={a.id} type={a.type} size="lg" />)
                  }
              </div>
          </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
              <Card>
                  <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center font-bold italic uppercase tracking-tight"><UserIcon className="w-5 h-5 mr-2 text-primary" /> Personnel Details</CardTitle>
                      <CardDescription>Core identity information for the regional directory.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="first_name">First Name</Label>
                              <Input id="first_name" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} disabled={isUpdating} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="last_name">Last Name</Label>
                              <Input id="last_name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} disabled={isUpdating} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="location" className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-muted-foreground" /> Base Location</Label>
                          <Input id="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Pittsburgh, PA" disabled={isUpdating} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="avatar_url" className="flex items-center"><Image className="w-4 h-4 mr-1 text-muted-foreground" /> Profile Photo URL</Label>
                          <Input id="avatar_url" value={formData.avatar_url} onChange={(e) => setFormData({...formData, avatar_url: e.target.value})} placeholder="https://example.com/photo.jpg" disabled={isUpdating} />
                      </div>
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader className="pb-4">
                      <CardTitle className="text-xl flex items-center font-bold italic uppercase tracking-tight"><Award className="w-5 h-5 mr-2 text-primary" /> Professional Profile</CardTitle>
                      <CardDescription>Share your HEMS experience and hardware setup.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="experience" className="flex items-center"><Award className="w-4 h-4 mr-1 text-muted-foreground" /> Experience Level</Label>
                          <Input id="experience" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 1,500 Flight Hours, P6/S3 Rated" disabled={isUpdating} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="simulators" className="flex items-center"><Monitor className="w-4 h-4 mr-1 text-muted-foreground" /> Simulators & Equipment</Label>
                          <Input id="simulators" value={formData.simulators} onChange={(e) => setFormData({...formData, simulators: e.target.value})} placeholder="e.g. X-Plane 12, VR, Virpil Controls" disabled={isUpdating} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="bio">Pilot Biography</Label>
                          <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell the community about your flight history..." rows={4} disabled={isUpdating} />
                      </div>
                  </CardContent>
              </Card>
          </div>

          <div className="md:col-span-1 space-y-6">
              <SubscriptionManager />
              
              <Card>
                  <CardHeader>
                      <CardTitle className="text-lg flex items-center font-bold italic uppercase tracking-tight"><Globe className="w-5 h-5 mr-2 text-primary" /> Digital Presence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="email_public" className="text-xs flex items-center"><Mail className="w-3 h-3 mr-1" /> Public Contact Email</Label>
                          <Input id="email_public" value={formData.email_public} onChange={(e) => setFormData({...formData, email_public: e.target.value})} placeholder="pilot@example.com" className="text-sm h-8" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="linkedin" className="text-xs flex items-center"><Linkedin className="w-3 h-3 mr-1 text-blue-600" /> LinkedIn Profile</Label>
                          <Input id="linkedin" value={formData.social_links.linkedin} onChange={(e) => setFormData({...formData, social_links: {...formData.social_links, linkedin: e.target.value}})} placeholder="URL" className="text-sm h-8" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="discord" className="text-xs flex items-center"><MessageCircle className="w-3 h-3 mr-1 text-indigo-500" /> Discord ID</Label>
                          <Input id="discord" value={formData.social_links.discord} onChange={(e) => setFormData({...formData, social_links: {...formData.social_links, discord: e.target.value}})} placeholder="Handle#0000" className="text-sm h-8" />
                      </div>
                  </CardContent>
              </Card>

              <div className="sticky top-6 space-y-4">
                  <Button type="submit" className="w-full h-14 text-lg font-black italic shadow-2xl rounded-2xl" disabled={isUpdating}>
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                      PUSH UPDATES
                  </Button>
              </div>
          </div>
      </form>
    </div>
  );
};

export default UserProfilePage;