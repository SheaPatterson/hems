"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, Copy, RefreshCw, Loader2, ShieldAlert, Info, Check, Eye, EyeOff, Radio, Activity, Server } from 'lucide-react';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { initXPlaneConnection } from '@/plugins/xplane/xplaneWebApi';

const PluginSettingsTab: React.FC = () => {
    const { profile, isRotatingKey, rotateApiKey } = useProfileManagement();
    const apiKey = profile?.api_key || 'LOGIN_TO_VIEW_KEY';
    
    const [copied, setCopied] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    
    // Connection Settings
    const [host, setHost] = useState('localhost');
    const [port, setPort] = useState('8086');

    useEffect(() => {
        const savedHost = localStorage.getItem('xp_host');
        const savedPort = localStorage.getItem('xp_port');
        if (savedHost) setHost(savedHost);
        if (savedPort) setPort(savedPort);
    }, []);

    const saveConnectionSettings = () => {
        localStorage.setItem('xp_host', host);
        localStorage.setItem('xp_port', port);
        toast.success("Connection parameters cached.");
    };

    const maskedApiKey = apiKey.length > 8 ? '••••••••••••••••••••••••••••••••' : apiKey;

    const handleCopyKey = () => {
        if (apiKey === 'LOGIN_TO_VIEW_KEY') {
            toast.error("Please log in to view your API key.");
            return;
        }
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("API Key copied to clipboard.");
    };

    const handleRotateKey = async () => {
        if (apiKey === 'LOGIN_TO_VIEW_KEY') return;
        try {
            await rotateApiKey();
        } catch (error) {
            // Handled by hook
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        saveConnectionSettings();
        const success = await initXPlaneConnection(host, parseInt(port, 10));
        setIsTesting(false);
        if (success) {
            toast.success(`Uplink established with X-Plane at ${host}:${port}`);
        } else {
            toast.error(`Handshake failed at ${host}:${port}. Verify Web API plugin status.`);
        }
    };

    return (
        <Card className="border-2 border-primary/20 shadow-xl bg-card/50 backdrop-blur">
            <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center">
                    <Key className="w-6 h-6 mr-2 text-primary" /> Plugin Authentication & Link
                </CardTitle>
                <CardDescription>Manage your unique API key and test local simulator connectivity.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* API Key Management */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiKey" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                                <Key className="w-3 h-3 mr-1" /> Your Unique API Key
                            </Label>
                            <div className="flex space-x-2">
                                <Input 
                                    id="apiKey"
                                    readOnly 
                                    value={showApiKey ? apiKey : maskedApiKey} 
                                    type={showApiKey ? 'text' : 'password'}
                                    className="font-mono text-sm bg-muted flex-grow h-11" 
                                    disabled={apiKey === 'LOGIN_TO_VIEW_KEY'}
                                />
                                <Button onClick={() => setShowApiKey(!showApiKey)} variant="outline" size="icon" className="h-11 w-11" disabled={apiKey === 'LOGIN_TO_VIEW_KEY'}>
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button onClick={handleCopyKey} variant="outline" size="icon" className="h-11 w-11" disabled={copied || apiKey === 'LOGIN_TO_VIEW_KEY'}>
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="w-full text-[10px] font-bold uppercase tracking-widest h-9" 
                                    disabled={isRotatingKey || apiKey === 'LOGIN_TO_VIEW_KEY'}
                                >
                                    {isRotatingKey ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                                    Rotate Security Token
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center text-destructive">
                                        <ShieldAlert className="w-5 h-5 mr-2" /> Security Warning
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Rotating your API key will immediately invalidate the current key. All active simulator sessions using the old key will be disconnected.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={handleRotateKey}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Confirm Rotation
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Connection Parameters */}
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                            <Radio className="w-3 h-3 mr-1 text-primary" /> Hardware Link Parameters
                        </Label>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="xp_host" className="text-[9px] font-bold text-muted-foreground uppercase">Host Address</Label>
                                <div className="relative">
                                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                    <Input id="xp_host" value={host} onChange={(e) => setHost(e.target.value)} className="pl-8 h-10 font-mono text-xs" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="xp_port" className="text-[9px] font-bold text-muted-foreground uppercase">Port</Label>
                                <Input id="xp_port" value={port} onChange={(e) => setPort(e.target.value)} className="h-10 font-mono text-xs text-center" />
                            </div>
                        </div>

                        <Button onClick={handleTestConnection} disabled={isTesting} className="w-full h-11 bg-secondary text-secondary-foreground font-black italic uppercase shadow-md hover:bg-secondary/80">
                            {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
                            Run Connection Handshake
                        </Button>
                    </div>
                </div>

                <Separator className="opacity-50" />
                
                <Alert className="bg-primary/[0.03] border-primary/20 rounded-2xl">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-xs font-medium leading-relaxed text-muted-foreground">
                        The HEMS Web Client attempts to establish a direct CORS-compliant socket with your local machine. 
                        If the handshake fails, ensure your browser is not forcing HTTPS on localhost and that 
                        the X-Plane Web API plugin whitelist includes <strong>{window.location.hostname}</strong>.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default PluginSettingsTab;