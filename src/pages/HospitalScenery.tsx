import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Image, FileArchive, AlertCircle, Eye } from 'lucide-react';
import { useHemsData } from '@/hooks/useHemsData';
import { useHospitalScenery } from '@/hooks/useHospitalScenery';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';

const SceneryGalleryCard: React.FC<{ hospitalName: string; hospitalId: string; imageUrls: string[]; description: string | null; zipUrl: string | null }> = ({ hospitalName, hospitalId, imageUrls, description, zipUrl }) => {
    const isPlaceholder = imageUrls.length === 0 || (imageUrls[0] && imageUrls[0].includes('placeholder.svg'));
    const displayUrls = imageUrls.length > 0 ? imageUrls : ['/public/placeholder.svg'];

    const handleDownload = () => {
        if (zipUrl) {
            window.open(zipUrl, '_blank');
            toast.success(`Initiating scenery package download for ${hospitalName}.`);
        } else {
            toast.error(`The official scenery ZIP package has not been uploaded for ${hospitalName} yet.`);
        }
    };

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-xl flex flex-col h-full">
            <div className="relative h-48 bg-black">
                {displayUrls.length > 1 ? (
                    <Carousel className="w-full h-full">
                        <CarouselContent>
                            {displayUrls.map((url, index) => (
                                <CarouselItem key={index} className="h-48">
                                    <img 
                                        src={url} 
                                        alt={`Scenery for ${hospitalName} - Image ${index + 1}`} 
                                        className={cn("w-full h-full object-cover", isPlaceholder && "opacity-50")}
                                        onError={(e) => (e.currentTarget.src = '/public/placeholder.svg')}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>
                ) : (
                    <img 
                        src={displayUrls[0]} 
                        alt={`Scenery for ${hospitalName}`} 
                        className={cn("w-full h-full object-cover", isPlaceholder && "opacity-30")}
                        onError={(e) => (e.currentTarget.src = '/public/placeholder.svg')}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex items-end pointer-events-none">
                    <h3 className="text-xl font-black text-white text-shadow-primary italic uppercase tracking-tight">{hospitalName}</h3>
                </div>
            </div>
            <CardContent className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{description || 'No operational notes provided.'}</p>
                
                <div className="pt-4 space-y-2">
                    <Button 
                        asChild
                        variant="outline" 
                        className="w-full font-bold italic" 
                    >
                        <Link to={`/hospital-scenery/${hospitalId}`}>
                            <Eye className="w-4 h-4 mr-2" /> View Full Briefing
                        </Link>
                    </Button>
                    <Button 
                        className="w-full bg-primary text-primary-foreground font-bold italic" 
                        onClick={handleDownload}
                        disabled={!zipUrl}
                    >
                        <FileArchive className="w-4 h-4 mr-2" /> Download ZIP Package
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const HospitalScenery = () => {
    const { hospitals, isLoading: isHospitalsLoading } = useHemsData();
    const { sceneryQuery } = useHospitalScenery();

    const isLoading = isHospitalsLoading || sceneryQuery.isLoading;
    const isError = sceneryQuery.isError;

    const sceneryMap = new Map(sceneryQuery.data?.map(s => [s.hospital_id, s]) || []);
    
    const galleryData = hospitals.map(h => ({
        hospitalName: h.name,
        hospitalId: h.id,
        imageUrls: sceneryMap.get(h.id)?.image_urls || [],
        description: sceneryMap.get(h.id)?.description || null,
        zipUrl: sceneryMap.get(h.id)?.zip_url || null,
    }));

    return (
        <div className="container mx-auto p-4 space-y-8 max-w-7xl">
            <PageHeader 
                title="Hospital Scenery Gallery"
                description="High-fidelity visual assets and custom flight simulator scenery packages."
                icon={Image}
            />

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : isError ? (
                <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                    <div className="space-y-1">
                        <p className="text-destructive font-bold">Error synchronizing visual asset registry.</p>
                        <p className="text-sm text-muted-foreground">Check database connection and RLS policies.</p>
                    </div>
                </div>
            ) : galleryData.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed rounded-2xl">
                    <p className="text-muted-foreground">No hospitals have visual assets configured.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {galleryData.map((item, index) => (
                        <SceneryGalleryCard 
                            key={index} 
                            hospitalName={item.hospitalName} 
                            hospitalId={item.hospitalId}
                            imageUrls={item.imageUrls} 
                            description={item.description}
                            zipUrl={item.zipUrl}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HospitalScenery;