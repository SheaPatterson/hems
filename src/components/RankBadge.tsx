import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Award, Medal, Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PilotRank } from '@/utils/pilotRankUtils';

interface RankBadgeProps {
    rank: PilotRank;
    className?: string;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, className }) => {
    const getIcon = () => {
        switch (rank.level) {
            case 6: return <Crown className="w-3 h-3 mr-1 fill-current" />;
            case 5: return <Medal className="w-3 h-3 mr-1 fill-current" />;
            case 4: return <Award className="w-3 h-3 mr-1 fill-current" />;
            case 3: return <Shield className="w-3 h-3 mr-1 fill-current" />;
            case 2: return <Star className="w-3 h-3 mr-1 fill-current" />;
            default: return <User className="w-3 h-3 mr-1" />;
        }
    };

    return (
        <Badge 
            className={cn(
                "font-black italic uppercase tracking-widest px-2.5 py-0.5 border-none shadow-sm",
                rank.color,
                className
            )}
        >
            {getIcon()}
            {rank.title}
        </Badge>
    );
};

export default RankBadge;