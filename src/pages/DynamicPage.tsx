"use client";

import { useParams } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SanitizedHTML from '@/components/SanitizedHTML';
import { Separator } from '@/components/ui/separator';

const DynamicPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: content, isLoading, isError } = useContent(slug || '');

    if (isLoading) {
        return (
            <div className="container mx-auto p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Retrieving Secure Document...</p>
            </div>
        );
    }

    if (isError || !content) {
        return (
            <div className="container mx-auto p-8 max-w-4xl">
                <div className="p-12 border-2 border-dashed rounded-[2.5rem] bg-muted/20 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                    <h2 className="text-xl font-black uppercase italic">Document Not Found</h2>
                    <p className="text-sm text-muted-foreground">The requested path "/{slug}" has not been initialized in the Content Engine.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8 animate-in fade-in duration-700">
            <PageHeader 
                title={content.title}
                description={`Official version updated: ${new Date(content.updated_at).toLocaleDateString()}`}
                icon={FileText}
            />

            <Card className="border-2 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 md:p-12">
                    <article className="prose prose-orange dark:prose-invert max-w-none prose-h2:font-black prose-h2:uppercase prose-h2:italic prose-h2:tracking-tight prose-h2:border-b prose-h2:pb-2 prose-h2:mb-6 prose-p:text-muted-foreground prose-p:leading-relaxed">
                        <SanitizedHTML html={content.body} />
                    </article>
                </CardContent>
            </Card>

            <Separator className="opacity-50" />
            
            <footer className="text-center pb-20">
                <div className="inline-flex items-center space-x-2 text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    <span>Authenticity Guaranteed by SRP Consulting Group</span>
                </div>
            </footer>
        </div>
    );
};

export default DynamicPage;