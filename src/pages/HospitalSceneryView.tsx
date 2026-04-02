import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, MapPin, Image, FileArchive, AlertCircle, ArrowLeft, HeartPulse, Globe } from 'lucide-react';
import { useHemsData } from '@/hooks/useHemsData';
import { useHospitalScenery } from '@/hooks/useHospitalScenery';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const HospitalSceneryView = () => {
    const { id } = useParams<{ id: string }>();
    const { hospitals, isLoading: isHospitalsLoading } = useHemsData();
    const { sceneryQuery } = useHospitalScenery();

    const isLoading = isHospitalsLoading || sceneryQuery.isLoading;
    const hospital = hospitals.find(h => h.id === id);
    const scenery = sceneryQuery.data?.find(s => s.hospital_id === id);

    if (isLoading) {
        return (
            <div className="container mx-auto p-20 flex flex-col justify-center items-center h-64 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Facility Data...</p>
            </div>
        );
    }

    if (!hospital) {
        toast.error("Hospital not found.");
        return <Navigate to="/hospital-directory" replace />;
    }

    const imageUrls = scenery?.image_urls || [];
    const displayUrls = imageUrls.length > 0 ? imageUrls : ['/public/placeholder.svg'];
    const isPlaceholder = imageUrls.length === 0;

    const handleDownload = () => {
        if (scenery?.zip_url) {
            window.open(scenery.zip_url, '_blank');
            toast.success(`Initiating scenery package download for ${hospital.name}.`);
        } else {
            toast.error(`The official scenery ZIP package has not been uploaded for ${hospital.name} yet.`);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                    <Link to="/hospital-scenery">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Gallery
                    </Link>
                </Button>
            </div>

            <PageHeader 
                title={hospital.name}
                description={`Visual briefing and asset download center for ${hospital.city}.`}
                icon={MapPin}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details and Download */}
                <Card className="lg:col-span-1 space-y-6 p-6 border-l-4 border-primary/70">
                    <div className="space-y-4">
                        <h3 className="text-xl font-black italic uppercase tracking-tight text-foreground">Facility Details</h3>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <HeartPulse className="w-4 h-4 text-red-600" />
                                <span className="font-bold text-sm">Trauma Designation:</span>
                                <Badge 
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-tighter",
                                        hospital.isTraumaCenter ? "bg-red-600 hover:bg-red-700" : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {hospital.isTraumaCenter ? `Level ${hospital.traumaLevel || 1}` : 'General Facility'}
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <span className="font-bold text-sm">FAA Identifier:</span>
                                <span className="font-mono text-sm">{hospital.faaIdentifier || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="font-bold text-sm">Coordinates:</span>
                                <span className="font-mono text-sm">{hospital.latitude.toFixed(4)}, {hospital.longitude.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-xl font-black italic uppercase tracking-tight text-primary">Scenery Package</h3>
                        {scenery?.zip_url ? (
                            <Button 
                                className="w-full bg-primary text-primary-foreground font-bold italic h-12 text-lg shadow-lg" 
                                onClick={handleDownload}
                            >
                                <FileArchive className="w-5 h-5 mr-2" /> Download Scenery ZIP
                            </Button>
                        ) : (
                            <Alert variant="default" className="bg-blue-500/10 border-blue-600/30">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-600">Package Pending</AlertTitle>
                                <AlertDescription>
                                    The official simulator scenery package is not yet available for download.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </Card>

                {/* Right Column: Image Gallery */}
                <Card className="lg:col-span-2 overflow-hidden border-2 border-primary/20 shadow-2xl bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-xl flex items-center font-bold italic uppercase">
                            <Image className="w-5 h-5 mr-2 text-primary" /> Landing Zone Visual Briefing
                        </CardTitle>
                        <CardDescription className="text-xs">{scenery?.description || 'No operational notes provided.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[450px] w-full relative">
                            {isPlaceholder ? (
                                <div className="h-full flex flex-col items-center justify-center bg-muted/20">
                                    <Image className="w-16 h-16 mb-4 opacity-10" />
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">No Visual Assets Configured</p>
                                </div>
                            ) : (
                                <Carousel className="w-full h-full">
                                    <CarouselContent>
                                        {displayUrls.map((url, index) => (
                                            <CarouselItem key={index} className="h-[450px]">
                                                <img 
                                                    src={url} 
                                                    alt={`Scenery for ${hospital.name} - Image ${index + 1}`} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.currentTarget.src = '/public/placeholder.svg')}
                                                />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="left-4" />
                                    <CarouselNext className="right-4" />
                                </Carousel>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HospitalSceneryView;