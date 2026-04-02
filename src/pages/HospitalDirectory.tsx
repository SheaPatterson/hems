import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Loader2, Globe, Image, AlertCircle, Eye, FileArchive } from 'lucide-react';
import { useHemsData } from '@/hooks/useHemsData';
import { useHospitalScenery } from '@/hooks/useHospitalScenery';
import { Input } from '@/components/ui/input';
import { Hospital } from '@/data/hemsData';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface HospitalDisplayData extends Hospital {
    imageUrls: string[];
    description: string | null;
    zipUrl: string | null;
}

const HospitalCard: React.FC<{ hospital: HospitalDisplayData }> = ({ hospital }) => {
    const isPlaceholder = hospital.imageUrls.length === 0 || (hospital.imageUrls[0] && hospital.imageUrls[0].includes('placeholder.svg'));
    const displayUrls = hospital.imageUrls.length > 0 ? hospital.imageUrls : ['/public/placeholder.svg'];

    const handleDownload = () => {
        if (hospital.zipUrl) {
            window.open(hospital.zipUrl, '_blank');
            toast.success(`Initiating scenery package download for ${hospital.name}.`);
        } else {
            toast.error(`The official scenery ZIP package has not been uploaded for ${hospital.name} yet.`);
        }
    };

    return (
        <Card className="hover:shadow-2xl transition-all duration-300 border-l-4 border-primary/70 overflow-hidden bg-card/40 backdrop-blur-sm">
            <div className="relative h-44 bg-muted overflow-hidden">
                {displayUrls.length > 1 ? (
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {displayUrls.map((url, index) => (
                                <CarouselItem key={index} className="h-44">
                                    <img 
                                        src={url} 
                                        alt={`LZ at ${hospital.name}`} 
                                        className={cn("w-full h-full object-cover transition-transform hover:scale-110 duration-700", isPlaceholder && "opacity-30")}
                                        onError={(e) => (e.currentTarget.src = '/public/placeholder.svg')}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="absolute bottom-4 right-10 flex space-x-2">
                            <CarouselPrevious className="relative h-8 w-8" />
                            <CarouselNext className="relative h-8 w-8" />
                        </div>
                    </Carousel>
                ) : (
                    <img 
                        src={displayUrls[0]} 
                        alt={`LZ at ${hospital.name}`} 
                        className={cn("w-full h-full object-cover", isPlaceholder && "opacity-30")}
                        onError={(e) => (e.currentTarget.src = '/public/placeholder.svg')}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end pointer-events-none">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Affiliated Facility</p>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-tight">{hospital.name}</h3>
                </div>
            </div>

            <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-bold flex items-center text-muted-foreground uppercase tracking-widest">
                        <MapPin className="w-3 h-3 mr-1 text-primary" /> {hospital.city}
                    </CardTitle>
                    <Badge 
                        className={cn(
                            "text-[10px] font-black uppercase tracking-tighter",
                            hospital.isTraumaCenter ? "bg-red-600 hover:bg-red-700" : "bg-muted text-muted-foreground"
                        )}
                    >
                        {hospital.isTraumaCenter ? `Level ${hospital.traumaLevel || 1}` : 'General'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
                <Separator className="opacity-50" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center"><Globe className="w-3 h-3 mr-1" /> Identifier</span>
                        <p className="font-mono text-sm font-bold text-primary">{hospital.faaIdentifier || 'LZ-00'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center"><Image className="w-3 h-3 mr-1" /> Assets</span>
                        <p className="font-bold">{hospital.imageUrls.length > 0 ? `${hospital.imageUrls.length} Imagery Sets` : 'None Available'}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8">
                        <Link to={`/hospital-scenery/${hospital.id}`}>
                            <Eye className="w-3 h-3 mr-1" /> View Briefing
                        </Link>
                    </Button>
                    <Button 
                        variant="default" 
                        size="sm" 
                        className="text-[10px] font-bold uppercase tracking-widest h-8"
                        onClick={handleDownload}
                        disabled={!hospital.zipUrl}
                    >
                        <FileArchive className="w-3 h-3 mr-1" /> Download ZIP
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const HospitalDirectory = () => {
  const { hospitals, isLoading: isHospitalsLoading, isError: isHospitalsError } = useHemsData();
  const { sceneryQuery } = useHospitalScenery();
  const [searchTerm, setSearchTerm] = useState('');

  const isLoading = isHospitalsLoading || sceneryQuery.isLoading;
  const isError = isHospitalsError || sceneryQuery.isError;
  
  const sceneryMap = new Map((sceneryQuery.data || []).map(s => [s.hospital_id, s]));

  const hospitalsWithScenery: HospitalDisplayData[] = hospitals.map(hospital => ({
    ...hospital,
    imageUrls: sceneryMap.get(hospital.id)?.image_urls || [],
    description: sceneryMap.get(hospital.id)?.description || null,
    zipUrl: sceneryMap.get(hospital.id)?.zip_url || null,
  }));

  const filteredHospitals = hospitalsWithScenery.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (hospital.faaIdentifier || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
      <PageHeader 
        title="Regional Hospital Map"
        description="Verified landing zones, trauma center designations, and facility visual briefings."
        icon={MapPin}
        actions={
            <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Facility Name / City / FAA ID..."
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
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing Hospital Registry...</p>
        </div>
      ) : isError ? (
        <div className="p-12 bg-destructive/5 border-2 border-destructive/20 rounded-3xl flex flex-col items-center text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div className="space-y-1">
                <p className="text-destructive font-black uppercase text-xl">Operational Data Link Failure</p>
                <p className="text-sm text-muted-foreground">The system was unable to synchronize with the regional facility database.</p>
            </div>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
            <Search className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-bold italic">No matching facilities found in the HEMS network.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalDirectory;