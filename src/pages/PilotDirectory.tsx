import { useState } from 'react';
import { PlaneTakeoff, Loader2, Search, Users } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import PilotCard from '@/components/PilotCard';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';

const PilotDirectory = () => {
  const { data: profiles, isLoading, isError } = useProfiles();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProfiles = (profiles || []).filter(profile => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const experience = (profile.experience || '').toLowerCase();
    const location = (profile.location || '').toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) || 
           experience.includes(searchTerm.toLowerCase()) ||
           location.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      <PageHeader 
        title="Personnel Manifest"
        description="Registry of active HEMS pilots, flight nurses, and medical specialists."
        icon={Users}
        actions={
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search by name, rating, or base..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-card border-2 focus-visible:ring-primary"
                />
            </div>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing Personnel Records...</p>
        </div>
      ) : isError ? (
        <div className="p-10 text-center border-2 border-destructive/20 bg-destructive/5 rounded-3xl">
            <p className="text-destructive font-bold text-lg">Communication Link Failure</p>
            <p className="text-sm text-muted-foreground">Failed to connect to the regional personnel database. Check permissions.</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/20">
            <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-bold italic">No flight crew found matching your search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProfiles.map((profile) => (
            <PilotCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      <footer className="pt-20 flex justify-center">
        <div className="inline-flex items-center space-x-3 bg-muted/50 px-6 py-2 rounded-full border border-border/50 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
            <PlaneTakeoff className="w-4 h-4 text-primary" />
            <span>Operational Personnel Registered: {profiles?.length || 0}</span>
        </div>
      </footer>
    </div>
  );
};

export default PilotDirectory;