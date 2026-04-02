import { useState, useEffect } from 'react';
import { useMissionSimulator } from '@/hooks/useMissionSimulator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MISSION_PHASES, FlightPhase } from '@/data/hemsData'; // Imported FlightPhase
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export const TacticalOverridePanel = () => {
    const { tracking, applyTacticalUpdate } = useMissionSimulator();
    
    // Explicitly type useState to FlightPhase
    const [phase, setPhase] = useState<FlightPhase>(tracking?.phase || 'standby' as FlightPhase);
    const [lat, setLat] = useState(tracking?.latitude.toFixed(6) || '0.000000');
    const [lon, setLon] = useState(tracking?.longitude.toFixed(6) || '0.000000');
    const [fuel, setFuel] = useState(tracking?.fuelRemainingLbs.toString() || '0');

    // Sync local state with simulator state when tracking updates (e.g., when override is toggled off/on)
    useEffect(() => {
        if (tracking) {
            setLat(tracking.latitude.toFixed(6));
            setLon(tracking.longitude.toFixed(6));
            setFuel(tracking.fuelRemainingLbs.toString());
            setPhase(tracking.phase); // Now correctly typed as FlightPhase
        }
    }, [tracking]);

    const handleApply = () => {
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);
        const newFuel = parseInt(fuel);

        if (isNaN(newLat) || isNaN(newLon) || isNaN(newFuel)) {
            toast.error("Invalid input for Latitude, Longitude, or Fuel.");
            return;
        }

        applyTacticalUpdate({
            latitude: newLat,
            longitude: newLon,
            fuelRemainingLbs: newFuel,
            phase: phase, 
            // Speed and Heading are intentionally omitted for simplicity in manual override
            speedKnots: 0, 
            heading: 0,
        });
        toast.success("Tactical update applied.");
    };

    return (
        <div className="space-y-4 p-2 border rounded-lg bg-yellow-50/50 border-yellow-300">
            <h4 className="text-sm font-semibold text-yellow-700">MANUAL OVERRIDE ACTIVE</h4>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="lat" className="text-xs">Latitude</Label>
                    <Input 
                        id="lat" 
                        type="number" 
                        step="0.000001" 
                        value={lat} 
                        onChange={(e) => setLat(e.target.value)} 
                        className="h-8 text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="lon" className="text-xs">Longitude</Label>
                    <Input 
                        id="lon" 
                        type="number" 
                        step="0.000001" 
                        value={lon} 
                        onChange={(e) => setLon(e.target.value)} 
                        className="h-8 text-xs"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="fuel" className="text-xs">Fuel (Lbs)</Label>
                    <Input 
                        id="fuel" 
                        type="number" 
                        value={fuel} 
                        onChange={(e) => setFuel(e.target.value)} 
                        className="h-8 text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="phase" className="text-xs">Phase</Label>
                    <Select 
                        value={phase} 
                        onValueChange={(value) => setPhase(value as FlightPhase)} // Fixed TS2322 (Error 8)
                    >
                        <SelectTrigger id="phase" className="h-8 text-xs">
                            <SelectValue placeholder="Select Phase" />
                        </SelectTrigger>
                        <SelectContent>
                            {MISSION_PHASES.map((p: string) => (
                                <SelectItem key={p} value={p} className="text-xs">
                                    {p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button 
                onClick={handleApply} 
                className="w-full h-8 text-xs bg-yellow-600 hover:bg-yellow-700"
            >
                <Send className="w-3 h-3 mr-2" />
                Apply Manual Update
            </Button>
        </div>
    );
};