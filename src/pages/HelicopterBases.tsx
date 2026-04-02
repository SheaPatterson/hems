import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Search, Loader2, Plane, Globe, AlertCircle } from 'lucide-react';
import { useHemsData } from '@/hooks/useHemsData';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/PageHeader';

const HelicopterBases = () => {
  const { bases, helicopters, isLoading, isError, error } = useHemsData();
  const [searchTerm, setSearchTerm] = useState('');

  // Map helicopters by ID for quick display on the base card
  const helicopterMap = new Map(helicopters.map(h => [h.id, h]));

  const filteredBases = bases.filter(base =>
    base.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    base.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (base.faaIdentifier || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      <PageHeader 
        title="HEMS Operational Bases"
        description="Geographic distribution and asset status of regional flight stations."
        icon={MapPin}
        actions={
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Station Name / FAA ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-card border-2 focus-visible:ring-primary"
                />
            </div>
        }
      />

      <Card className="border-t-4 border-primary overflow-hidden">
        <CardContent className="p-8">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                <div className="space-y-1">
                    <p className="text-destructive font-bold text-lg uppercase tracking-tighter">Station Data Link Failure</p>
                    <p className="text-sm text-muted-foreground">{(error as Error)?.message || 'Database connection error.'}</p>
                </div>
            </div>
          ) : filteredBases.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
                <Search className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground font-bold italic">No stations found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBases.map((base) => {
                const assignedHeli = base.helicopterId ? helicopterMap.get(base.helicopterId) : null;
                
                return (
                  <Card key={base.id} className="hover:shadow-2xl transition-all duration-300 border-l-4 border-primary overflow-hidden bg-card/40 backdrop-blur-sm flex flex-col h-full">
                    {assignedHeli?.imageUrl && (
                        <div className="h-36 w-full bg-black relative">
                            <img src={assignedHeli.imageUrl} alt={assignedHeli.registration} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-black italic uppercase tracking-tighter">{base.name}</CardTitle>
                        <Badge variant="secondary" className="font-mono text-[10px] tracking-widest">{base.faaIdentifier || 'LZ'}</Badge>
                      </div>
                      <CardDescription className="flex items-center font-medium">
                        <MapPin className="w-3 h-3 mr-1 text-primary" /> {base.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-grow flex flex-col justify-between pt-4">
                      <div className="space-y-3">
                        <Separator className="opacity-50" />
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Primary Asset</p>
                          {assignedHeli ? (
                            <div className="flex items-center p-3 bg-primary/5 rounded-xl border border-primary/10 shadow-inner group cursor-default">
                              <Plane className="w-6 h-6 mr-3 text-primary transition-transform group-hover:rotate-12" />
                              <div>
                                <p className="text-sm font-black italic leading-none">{assignedHeli.registration}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">{assignedHeli.model}</p>
                              </div>
                              <Badge className="ml-auto bg-green-600 text-[8px] font-black italic h-4 px-1.5 shadow-sm">ACTIVE</Badge>
                            </div>
                          ) : (
                            <div className="flex items-center p-3 bg-muted/50 rounded-xl text-muted-foreground italic text-xs border border-dashed">
                              Asset offline or unassigned.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] font-bold pt-2 border-t border-border/50">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{base.contact || 'VHF LINK'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Globe className="w-3.5 h-3.5" />
                          <span className="font-mono">{base.latitude.toFixed(3)}, {base.longitude.toFixed(3)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelicopterBases;