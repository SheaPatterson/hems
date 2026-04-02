import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Check, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeatureListItem: React.FC<{ children: React.ReactNode, included: boolean }> = ({ children, included }) => (
    <li className={cn("flex items-start space-x-3", !included && "text-muted-foreground line-through opacity-60")}>
        {included ? <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />}
        <span>{children}</span>
    </li>
);

const PricingPage = () => {
    const { profile, isLoading, initiateCheckout, isInitiatingCheckout, initiateCustomerPortal, isInitiatingPortal } = useProfileManagement();

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isSubscribed = profile?.is_subscribed ?? false;

    const handleSubscribe = async () => {
        if (!profile) return;
        await initiateCheckout();
    };

    return (
        <div className="container mx-auto p-8 max-w-5xl">
            <header className="text-center mb-16 space-y-4">
                <h1 className="text-5xl font-black tracking-tighter uppercase italic">Subscription Tiers</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose the plan that matches your commitment to high-fidelity flight simulation.
                </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Basic Plan */}
                <Card className="shadow-lg rounded-3xl h-full flex flex-col">
                    <CardHeader className="p-8">
                        <CardTitle className="text-3xl font-black tracking-tight">Basic Access</CardTitle>
                        <CardDescription className="text-base">
                            <span className="text-4xl font-black text-foreground">$0</span> / month
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-grow">
                        <p className="text-sm mb-6">For casual pilots and community members.</p>
                        <ul className="space-y-4">
                            <FeatureListItem included={true}>Pilot Directory & Profile</FeatureListItem>
                            <FeatureListItem included={true}>View Mission History & Reports</FeatureListItem>
                            <FeatureListItem included={true}>File Safety Incident Reports (SMS)</FeatureListItem>
                            <FeatureListItem included={true}>Access Community Forums</FeatureListItem>
                            <FeatureListItem included={false}>Mission Planning & Dispatch</FeatureListItem>
                            <FeatureListItem included={false}>Live Flight Following & Telemetry</FeatureListItem>
                            <FeatureListItem included={false}>AI Tactical Controller Comms</FeatureListItem>
                            <FeatureListItem included={false}>Simulator Client Access</FeatureListItem>
                        </ul>
                    </CardContent>
                    <CardFooter className="p-8 bg-muted/30 rounded-b-3xl">
                        <Button variant="outline" className="w-full h-12 text-lg font-bold" disabled>
                            Current Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className="border-4 border-primary shadow-2xl rounded-3xl relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-black px-6 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                        Recommended
                    </div>
                    <CardHeader className="p-8">
                        <CardTitle className="text-3xl font-black tracking-tight flex items-center">
                            <Zap className="w-6 h-6 mr-2 text-primary" /> Premium OPS-CENTER
                        </CardTitle>
                        <CardDescription className="text-base">
                            <span className="text-4xl font-black text-primary">$11.99</span> / month
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-grow">
                        <p className="text-sm mb-6">The complete suite for professional-grade simulation.</p>
                        <ul className="space-y-4">
                            <FeatureListItem included={true}><strong>All Basic Features, plus:</strong></FeatureListItem>
                            <FeatureListItem included={true}>Full Mission Planning & Dispatch System</FeatureListItem>
                            <FeatureListItem included={true}>Live Global Flight Following & Telemetry</FeatureListItem>
                            <FeatureListItem included={true}>AI Tactical Controller (Voice & Text)</FeatureListItem>
                            <FeatureListItem included={true}>In-Browser Simulator Client Access</FeatureListItem>
                            <FeatureListItem included={true}>Priority Access to New Scenery</FeatureListItem>
                            <FeatureListItem included={true}>Premium Discord Role & Channels</FeatureListItem>
                        </ul>
                    </CardContent>
                    <CardFooter className="p-8 bg-primary/5 rounded-b-3xl">
                        {isSubscribed ? (
                            <Button 
                                onClick={() => initiateCustomerPortal()} 
                                disabled={isInitiatingPortal}
                                variant="secondary" 
                                className="w-full h-14 text-lg font-bold"
                            >
                                {isInitiatingPortal ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                                Manage Subscription
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubscribe} 
                                disabled={isInitiatingCheckout} 
                                className="w-full h-14 text-lg font-black italic uppercase shadow-xl"
                            >
                                {isInitiatingCheckout ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Upgrade to Premium'}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default PricingPage;