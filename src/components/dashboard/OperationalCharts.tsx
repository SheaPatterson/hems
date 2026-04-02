import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, PieChart as PieIcon } from 'lucide-react';

interface OperationalChartsProps {
    missionHistory: any[];
}

const OperationalCharts: React.FC<OperationalChartsProps> = ({ missionHistory }) => {
    // 1. Mission Type Distribution
    const typeCount = missionHistory.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
    const COLORS = ['hsl(39 100% 50%)', 'hsl(215 20% 65%)'];

    // 2. Activity by Base (Top Bases)
    const baseCount = missionHistory.reduce((acc, m) => {
        const baseName = m.hemsBase?.name || 'Unknown';
        acc[baseName] = (acc[baseName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(baseCount)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Mission Type Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <PieIcon className="w-4 h-4 mr-2" /> Mission Mix
                    </CardTitle>
                    <CardDescription>Ratio of Scene Calls to Transfers</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Activity Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Activity className="w-4 h-4 mr-2" /> Top Operational Bases
                    </CardTitle>
                    <CardDescription>Dispatches per geographic sector</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            />
                            <Bar dataKey="count" fill="hsl(39 100% 50%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default OperationalCharts;