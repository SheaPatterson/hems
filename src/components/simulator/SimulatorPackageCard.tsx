import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, ListOrdered, ExternalLink, Zap, PlayCircle, Download, ShieldCheck, FileCode } from 'lucide-react';
import { SimulatorPackage } from '@/data/simulatorPackages';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface SimulatorPackageCardProps {
    pkg: SimulatorPackage;
    apiKey: string;
}

const SimulatorPackageCard: React.FC<SimulatorPackageCardProps> = ({ pkg, apiKey }) => {
    const navigate = useNavigate();
    
    const isWebClient = pkg.id === 'hems-web-client';

    const maskedApiKey = apiKey.length > 8 ? '••••••••••••••••••••••••••••••••' : apiKey;

    return (
        <Card className={`flex flex-col h-full ${isWebClient ? 'border-primary ring-1 ring-primary/20' : ''}`}>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                    <Zap className={`w-5 h-5 mr-2 ${isWebClient ? 'text-primary' : 'text-muted-foreground'}`} /> {pkg.name}
                    {isWebClient && <Badge className="ml-2 bg-primary">Built-in</Badge>}
                </CardTitle>
                <CardDescription className="flex justify-between items-center">
                    <span>{pkg.description}</span>
                    <Badge variant="secondary" className="flex items-center">
                        <Code className="w-3 h-3 mr-1" /> {pkg.pluginType}
                    </Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                
                <Separator />

                {/* API Key */}
                {!isWebClient && (
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center text-lg">
                            <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Secure API Key
                        </h4>
                        <div className="flex space-x-2">
                            <Input readOnly value={maskedApiKey} type="password" className="font-mono text-sm bg-muted flex-grow" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your unique key authenticates your simulator connection. View and copy the full key in the Settings tab.
                        </p>
                    </div>
                )}

                {isWebClient && (
                    <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                        <p className="text-sm font-medium text-primary flex items-center">
                            <PlayCircle className="w-4 h-4 mr-2" /> Direct Integration Test
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            This tool uses the actual system API endpoints to test mission dispatch, tracking, and scenery retrieval.
                        </p>
                    </div>
                )}

                <Separator />

                {/* Installation Steps */}
                <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-lg">
                        <ListOrdered className="w-4 h-4 mr-2 text-primary" /> {isWebClient ? 'Getting Started' : 'Installation Guide'}
                    </h4>
                    <ol className="list-decimal list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                        {pkg.installationSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            </CardContent>
            <div className="p-6 pt-0 space-y-3">
                <h4 className="font-semibold flex items-center text-lg">
                    {isWebClient ? 'Launch Interface' : 'Download Plugin'}
                </h4>
                <div className="space-y-2">
                    {pkg.downloads.map((download, index) => {
                        const isInternalNav = download.url === '/simulator-client';
                        const isExternalLink = download.url.startsWith('http');

                        if (isInternalNav) {
                            return (
                                <Button 
                                    key={index} 
                                    variant="default"
                                    className="w-full"
                                    onClick={() => navigate(download.url)}
                                >
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    {download.version}
                                </Button>
                            );
                        }

                        return (
                            <Button 
                                key={index} 
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <a 
                                    href={download.url} 
                                    download // Forces browser to download instead of navigate
                                    target={isExternalLink ? "_blank" : "_self"}
                                    rel={isExternalLink ? "noopener noreferrer" : ""}
                                >
                                    {download.isScript ? <FileCode className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                    {download.version}
                                </a>
                            </Button>
                        );
                    })}
                </div>
                
                {/* Documentation Link */}
                <Button asChild variant="ghost" className="w-full text-sm mt-2">
                    <a href={pkg.documentationUrl} target={isWebClient ? '_self' : '_blank'} rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" /> View Documentation
                    </a>
                </Button>
            </div>
        </Card>
    );
};

export default SimulatorPackageCard;