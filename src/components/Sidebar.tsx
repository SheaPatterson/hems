"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Zap, History, FileText, Users, MapPin, Settings,
    LayoutDashboard, Hospital, Code, MessageSquare, Image, Satellite, Map, Activity, Crosshair, Shield, Megaphone, BookOpen, Plane, Book, ShieldAlert, Coffee, Server
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from './AuthGuard'; 
import { useActiveMissions } from '@/hooks/useMissions';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    public?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const operationSections: NavSection[] = [
    {
        title: "Flight Operations",
        items: [
            { href: '/dashboard', label: 'Operations Command', icon: LayoutDashboard },
            { href: '/generate', label: 'Mission Dispatcher', icon: Zap },
            { href: '/logbook', label: 'Personal Logbook', icon: Book },
            { href: '/live-tracking', label: 'Global Tracking', icon: Satellite },
            { href: '/mission-history', label: 'Mission Archive', icon: History },
        ],
    },
    {
        title: "Safety & Compliance",
        items: [
            { href: '/incident-reports', label: 'SMS Reporting', icon: Shield },
            { href: '/flight-planning', label: 'Flight Guides / SOP', icon: Plane, public: true },
            { href: '/documentation', label: 'Technical Manual', icon: BookOpen, public: true },
        ],
    },
    {
        title: "Regional Assets",
        items: [
            { href: '/hospital-directory', label: 'Facility Registry', icon: Hospital },
            { href: '/helicopter-bases', label: 'HEMS Bases', icon: MapPin },
            { href: '/operational-map', label: 'Tactical Map', icon: Map },
            { href: '/hospital-scenery', label: 'LZ Visual Gallery', icon: Image },
            { href: '/local-bridge', label: 'Local Bridge Status', icon: Server }, // NEW LINK
        ],
    },
    {
        title: "Community",
        items: [
            { href: '/pilot-directory', label: 'Personnel Manifest', icon: Users },
            { href: '/plugins', label: 'Integration Hub', icon: Code, public: true },
            { href: '/community', label: 'Crew Q&A Board', icon: MessageSquare },
            { href: '/support', label: 'Support the Dev', icon: Coffee, public: true },
        ],
    },
];

const adminSections: NavSection[] = [
    {
        title: "HQ COMMAND",
        items: [
            { href: '/admin/overview', label: 'Admin Terminal', icon: Settings },
            { href: '/admin/live-ops', label: 'Live Operations', icon: Activity },
            { href: '/admin/safety-audit', label: 'Safety Audit', icon: ShieldAlert },
            { href: '/admin/notams', label: 'NOTAM Broadcast', icon: Megaphone },
            { href: '/admin/permission', label: 'Personnel Access', icon: Shield },
        ],
    },
    {
        title: "REGISTRY DATA",
        items: [
            { href: '/admin/aircraft', label: 'Fleet Registry', icon: Plane },
            { href: '/admin/crew-bases', label: 'HEMS Stations', icon: MapPin },
            { href: '/admin/hospitals', label: 'Facility Master', icon: Hospital },
            { href: '/admin/hospital-scenery', label: 'Visual Briefings', icon: Image },
            { href: '/admin/content', label: 'Content Engine', icon: FileText },
        ],
    },
];

const SidebarLink: React.FC<{ href: string; label: string; icon: React.ElementType, activeMission?: boolean }> = ({ href, label, icon: Icon, activeMission }) => {
    const location = useLocation();
    const isActive = location.pathname === href || (href === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard'));

    return (
        <Link
            to={href}
            className={cn(
                "group flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden",
                isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10 italic translate-x-1"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
            )}
        >
            {activeMission && href === '/live-tracking' && (
                <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none" />
            )}
            <Icon className={cn("w-4 h-4 mr-3 transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
            {label}
            {activeMission && href === '/live-tracking' && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
        </Link>
    );
};

const Sidebar = () => {
    const location = useLocation();
    const { user, isLoading: isAuthLoading } = useAuth(); 
    const { isAdmin } = useUserRole(); 
    const { data: activeMissions } = useActiveMissions();
    
    const isUserFlying = activeMissions?.some(m => m.user_id === user?.id);
    
    if (isAuthLoading) return <div className="hidden lg:block w-64 h-full border-r bg-card p-4"></div>;

    const isAdminRoute = location.pathname.startsWith('/admin');
    const sections = isAdminRoute ? adminSections : operationSections;

    return (
        <div className="hidden lg:flex w-64 h-full border-r bg-card/50 backdrop-blur-xl p-6 flex-col shrink-0">
            <div className="mb-10 space-y-6">
                <Link to="/" className="flex flex-col items-center group">
                    <div className="p-2 bg-primary/5 rounded-[2rem] border-2 border-primary/20 mb-4 group-hover:scale-105 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(255,165,0,0.2)]">
                        <img 
                            src="/logo-main.png" 
                            alt="HEMS Simulation Logo" 
                            className="w-24 h-24 object-contain" 
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                            {isAdminRoute ? <span className="text-primary">HQ</span> : "HEMS"} <span className="text-primary">OPS</span>
                        </h2>
                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.4em] mt-1 opacity-60">Operations Center</p>
                    </div>
                </Link>
                {user && isAdmin && (
                    <div className="flex justify-center">
                        <Link 
                            to={isAdminRoute ? '/dashboard' : '/admin/overview'} 
                            className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center bg-muted/50 px-4 py-1.5 rounded-full border border-border/50"
                        >
                            <Crosshair className="w-3 h-3 mr-2" />
                            {isAdminRoute ? 'EXIT TERMINAL' : 'ADMIN ACCESS'}
                        </Link>
                    </div>
                )}
            </div>
            
            <ScrollArea className="flex-grow -mx-2 px-2">
                <nav className="space-y-10 pb-10">
                    {sections.map((section) => {
                        const visibleItems = user ? section.items : section.items.filter(i => i.public);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={section.title} className="space-y-3">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/40 px-4 mb-2">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {visibleItems.map((item) => (
                                        <SidebarLink key={item.href} {...item} activeMission={isUserFlying} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </ScrollArea>

            {user && (
                <div className="mt-auto pt-4 border-t border-border/50 space-y-4">
                    <Link to="/user" className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                            <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-tighter truncate text-foreground">Pilot Profile</p>
                            <p className="text-[9px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar;