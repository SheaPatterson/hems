import React from 'react';
import { ACHIEVEMENT_TYPES } from '@/hooks/useAchievements';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, HeartPulse, Moon, ShieldCheck, Wrench, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = { Zap, HeartPulse, Moon, ShieldCheck, Wrench };

interface AchievementBadgeProps {
    type: string;
    size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ type, size = 'md' }) => {
    const meta = (ACHIEVEMENT_TYPES as any)[type] || { label: "Unknown Medal", icon: "Zap", color: "bg-muted", desc: "Operational milestone." };
    const Icon = iconMap[meta.icon] || Zap;

    const sizeClasses = {
        sm: "h-6 w-6 p-1",
        md: "h-10 w-10 p-2",
        lg: "h-14 w-14 p-3"
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn(
                    "rounded-full flex items-center justify-center text-white shadow-lg cursor-help transition-transform hover:scale-110 border-2 border-white/20",
                    meta.color,
                    sizeClasses[size]
                )}>
                    <Icon className="w-full h-full" />
                </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-primary/40 p-3 space-y-1">
                <p className="font-black uppercase italic text-xs text-primary">{meta.label}</p>
                <p className="text-[10px] font-medium text-white/80">{meta.desc}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default AchievementBadge;