import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Coffee, ShieldCheck } from 'lucide-react';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const SubscriptionManager: React.FC = () => {
    const { isLoading } = useProfileManagement();
    
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-primary/20 bg-primary/[0.02] shadow-xl overflow-hidden group">
            <CardHeader className="pb-4 bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center text-primary">
                    <ShieldCheck className="w-5 h-5 mr-2" /> Operational Status
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase">All systems authorized for public use.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 bg-background shadow-inner">
                    <span className="font-black italic uppercase text-xs">Access Level:</span>
                    <Badge className="bg-green-600 font-black italic px-4 h-6 border-none shadow-sm">
                        FULL THEATER ACCESS
                    </Badge>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground leading-relaxed italic">
                        HEMS OPS-CENTER is a free, community-driven project. We rely on donations to keep our global telemetry relays and AI agents online.
                    </p>
                    <Button asChild className="w-full h-12 bg-primary text-primary-foreground font-black italic uppercase shadow-lg hover:scale-[1.02] transition-transform rounded-xl">
                        <Link to="/support">
                            <Coffee className="w-5 h-5 mr-2" /> Support the mission
                        </Link>
                    </Button>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-[8px] font-black uppercase text-primary/60 tracking-widest">
                    <Heart className="w-3 h-3 fill-current" />
                    <span>Built for the HEMS community</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default SubscriptionManager;