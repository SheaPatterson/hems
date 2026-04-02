/**
 * Login Page — MSAL-based Azure AD B2C login
 *
 * Replaces the Supabase Auth UI form with a single "Sign In" button
 * that triggers the MSAL popup flow. The B2C hosted UI handles
 * email/password collection.
 *
 * Requirements: 2.7
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, LogIn } from 'lucide-react';
import { toast } from 'sonner';

function Login() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading, signIn } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signIn();
            navigate('/dashboard', { replace: true });
        } catch (err) {
            // User closed the popup or auth failed
            const message =
                err instanceof Error ? err.message : 'Authentication failed. Please try again.';
            toast.error(message);
        } finally {
            setIsSigningIn(false);
        }
    };

    // Show spinner while MSAL is initialising / checking cached session
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 space-y-10">
            <div className="flex flex-col items-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-[3rem] border-2 border-primary/20 shadow-2xl transition-transform hover:scale-105">
                    <img
                        src="/logo-main.png"
                        alt="HEMS Simulation Logo"
                        className="w-32 h-32 object-contain"
                    />
                </div>
                <div className="text-center space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary italic leading-none text-shadow-primary uppercase">
                        HEMS SIMULATION
                    </h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold">
                        Integrated Flight Operations
                    </p>
                </div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
                    <CardTitle className="text-xs text-center font-black uppercase tracking-[0.2em] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Secure Personnel Access
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 flex flex-col items-center space-y-4">
                    <p className="text-xs text-muted-foreground text-center uppercase tracking-widest">
                        Authenticate via secure identity provider
                    </p>
                    <Button
                        onClick={handleSignIn}
                        disabled={isSigningIn}
                        size="lg"
                        className="w-full max-w-xs font-bold uppercase tracking-wider"
                    >
                        {isSigningIn ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Authenticating…
                            </>
                        ) : (
                            <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center space-y-2">
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.3em] font-mono">
                    Terminal Protocol v5.2.0-STABLE
                </p>
                <div className="h-0.5 w-32 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-1/3 animate-[pulse_2s_infinite]" />
                </div>
            </div>
        </div>
    );
}

export default Login;
