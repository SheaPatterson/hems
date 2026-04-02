import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, icon: Icon, description }) => (
    <Card className="border-l-4 border-primary/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default AdminStatCard;