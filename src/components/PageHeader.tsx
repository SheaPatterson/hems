import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actions?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, actions, className }) => {
    return (
        <header className={cn("flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border/50 mb-8", className)}>
            <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center text-primary">
                    <Icon className="w-8 h-8 mr-3" /> {title}
                </h1>
                <p className="text-lg text-muted-foreground font-medium mt-1">
                    {description}
                </p>
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
        </header>
    );
};

export default PageHeader;