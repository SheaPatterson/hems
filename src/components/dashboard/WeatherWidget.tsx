import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Wind, Sun, AlertTriangle, CloudFog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const WeatherWidget: React.FC = () => {
    // Simulated weather for Western PA sectors
    const advisories = [
        { sector: "Allegheny", status: "VFR", wind: "240@08KT", temp: "18C", icon: Sun, color: "text-green-500" },
        { sector: "Mon Valley", status: "MVFR", wind: "Variable", temp: "14C", icon: CloudFog, color: "text-orange-500", note: "Valley fog reported" },
        { sector: "Erie/Shore", status: "LIFR", wind: "310@22KT", temp: "08C", icon: CloudRain, color: "text-red-500", note: "Storm system active" }
    ];

    return (
        <Card className="h-full border-2 border-primary/20 bg-card/50 backdrop-blur shadow-xl">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center">
                    <Wind className="w-4 h-4 mr-2 text-primary" /> Regional Weather Ops
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {advisories.map((adv) => (
                    <div key={adv.sector} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 group hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                            <adv.icon className={cn("w-5 h-5", adv.color)} />
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight">{adv.sector} Sector</p>
                                <p className="text-[9px] text-muted-foreground font-mono">{adv.wind} // {adv.temp}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className={cn("text-[9px] font-black italic px-2", adv.color, "border-current")}>
                                {adv.status}
                            </Badge>
                            {adv.note && <p className="text-[8px] text-muted-foreground mt-1 italic max-w-[80px] leading-tight">{adv.note}</p>}
                        </div>
                    </div>
                ))}
                
                <div className="pt-2">
                    <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl flex items-start space-x-3">
                        <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-700 dark:text-orange-400 font-medium leading-tight">
                            <strong>ADVISORY:</strong> Expect increasing mechanical turbulence near ridgelines in Westmoreland sector after 2200Z.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WeatherWidget;