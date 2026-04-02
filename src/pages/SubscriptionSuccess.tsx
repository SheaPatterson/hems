import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SubscriptionSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { profile, isLoading } = useProfileManagement();
    const [isConfirming, setIsConfirming] = useState(true); // State to show loading while waiting for webhook

    useEffect(() => {
        // The actual subscription activation is handled by the Stripe webhook.
        // This page just waits for the profile to reflect the updated status.
        if (!isLoading && profile) {
            if (profile.is_subscribed) {
                setIsConfirming(false);
                toast.success("Subscription confirmed and activated!");
            } else {
                // If profile is loaded but not subscribed, it means the webhook hasn't fired yet
                // or there was an issue. We'll keep showing loading for a bit, then suggest checking profile.
                const timeout = setTimeout(() => {
                    setIsConfirming(false);
                    toast.info("Subscription status update is taking longer than expected. Please check your profile in a moment.");
                }, 5000); // Wait 5 seconds for webhook to process
                return () => clearTimeout(timeout);
            }
        }
    }, [profile, isLoading]);

    if (isLoading || isConfirming) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Confirming your subscription...</p>
            </div>
        );
    }

    if (profile?.is_subscribed) {
        return (
            <div className="container mx-auto p-8 max-w-2xl">
                <Card className="border-4 border-green-600/50 bg-green-600/5 shadow-2xl">
                    <CardHeader className="text-center">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                        <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-green-600">
                            Subscription Activated!
                        </CardTitle>
                        <p className="text-lg text-muted-foreground mt-2">
                            Welcome to HEMS OPS-CENTER Premium.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            You now have full access to mission planning, live tracking, and all premium features.
                        </p>
                        <Button onClick={() => navigate('/dashboard')} size="lg" className="h-14 px-12 text-lg font-black italic uppercase shadow-xl">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fallback if confirmation failed or user is not logged in/subscribed
    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Subscription Confirmation Pending</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">We are waiting for confirmation from the payment provider. Please check your profile status shortly.</p>
                    <Button onClick={() => navigate('/user')} variant="link" className="mt-4">Check Profile Status</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscriptionSuccessPage;