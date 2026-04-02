import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { MapPin, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Location } from './types';
import SceneSelectorMap from '@/components/maps/SceneSelectorMap';
import ClientOnly from '@/components/ClientOnly'; // Import ClientOnly

// Default location (Pittsburgh area)
const DEFAULT_SCENE_LOCATION: Location = {
    name: 'Default Scene Location',
    latitude: 40.4406,
    longitude: -79.9959,
    faaIdentifier: 'SCENE',
};

interface SceneLocationSelectorProps {
    currentLocation: Location | null;
    onLocationSelect: (location: Location) => void;
}

const SceneLocationSelector: React.FC<SceneLocationSelectorProps> = ({ currentLocation, onLocationSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Internal state for map selection
    const [tempLocation, setTempLocation] = useState<Location>(currentLocation || DEFAULT_SCENE_LOCATION);

    useEffect(() => {
        if (currentLocation) {
            setTempLocation(currentLocation);
        }
    }, [currentLocation]);

    const handleLocationChange = (location: Location) => {
        setTempLocation(location);
    };

    const handleSave = () => {
        if (!tempLocation.latitude || !tempLocation.longitude) {
            toast.error("Please select a location on the map.");
            return;
        }
        onLocationSelect(tempLocation);
        setIsOpen(false);
        toast.success("Scene location updated.");
    };
    
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" /> Select Scene Location
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Select Scene Location</SheetTitle>
                    <SheetDescription>
                        Click on the map to pinpoint the exact accident location.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="flex-grow space-y-4 overflow-y-auto">
                    <div className="h-80 w-full rounded-lg relative overflow-hidden border border-primary/50">
                        {/* Ensure map only renders client-side to prevent crashes */}
                        <ClientOnly>
                            <SceneSelectorMap 
                                currentLocation={tempLocation}
                                onLocationChange={handleLocationChange}
                            />
                        </ClientOnly>
                    </div>

                    <div className="space-y-4 p-2 border rounded-lg">
                        <h4 className="font-semibold">Selected Coordinates:</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lat">Latitude</Label>
                                <Input id="lat" readOnly value={tempLocation.latitude.toFixed(5)} className="font-mono bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lon">Longitude</Label>
                                <Input id="lon" readOnly value={tempLocation.longitude.toFixed(5)} className="font-mono bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Location Name</Label>
                            <Input 
                                id="name" 
                                value={tempLocation.name} 
                                onChange={(e) => setTempLocation(prev => ({ ...prev, name: e.target.value, faaIdentifier: 'SCENE' }))}
                            />
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Save Location
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default SceneLocationSelector;