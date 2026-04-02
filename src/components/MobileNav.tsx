import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, LogIn, LayoutDashboard, Zap, History, FileText, Users, MapPin, BookOpen, Settings, Hospital, Code, MessageSquare, Image, Satellite, Map, Activity, Plane, Shield, Megaphone, Coffee, Book, ShieldAlert, Server } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { signOut } from '@/integrations/supabase/auth';
import { useAuth } from './AuthGuard';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

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
        title: "HQ Command",
        items: [
            { href: '/admin/overview', label: 'Admin Terminal', icon: Settings },
            { href: '/admin/live-ops', label: 'Live Operations', icon: Activity },
            { href: '/admin/safety-audit', label: 'Safety Audit', icon: ShieldAlert },
            { href: '/admin/notams', label: 'NOTAM Broadcast', icon: Megaphone },
            { href: '/admin/permission', label: 'Personnel Access', icon: Shield },
        ],
    },
    {
        title: "Registry Data",
        items: [
            { href: '/admin/aircraft', label: 'Fleet Registry', icon: Plane },
            { href: '/admin/crew-bases', label: 'HEMS Stations', icon: MapPin },
            { href: '/admin/hospitals', label: 'Facility Master', icon: Hospital },
            { href: '/admin/hospital-scenery', label: 'Visual Briefings', icon: Image },
            { href: '/admin/content', label: 'Content Engine', icon: FileText },
        ],
    }
];

const MobileSidebarLink: React.FC<{ href: string; label: string; icon: React.ElementType; onLinkClick: () => void }> = ({ href, label, icon: Icon, onLinkClick }) => {
    const location = useLocation();
    const isActive = location.pathname === href || (href === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard'));

    return (
        <Link
            to={href}
            onClick={onLinkClick}
            className={cn(
                "flex items-center p-3 rounded-xl text-base font-bold transition-all",
                isActive
                    ? "bg-primary text-primary-foreground italic translate-x-1"
                    : "text-foreground hover:bg-muted hover:text-primary"
            )}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
        </Link>
    );
};

const MobileNav: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { isAdmin } = useUserRole();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    const isAdminRoute = location.pathname.startsWith('/admin');
    const sections = isAdminRoute ? adminSections : operationSections;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden relative z-[40]">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col z-[1000] border-r-4 border-primary/20">
                <SheetHeader className="p-8 pb-4 bg-primary/5">
                    <SheetTitle className="flex flex-col items-center space-y-4">
                        <img src="/logo-main.png" alt="Logo" className="h-20 w-20 object-contain" />
                        <div className="text-center">
                            <span className="text-2xl font-black italic tracking-tighter uppercase text-primary text-shadow-primary">HEMS OPS</span>
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">Operations Center</p>
                        </div>
                    </SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="flex-grow px-4 mt-6">
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
                                            <MobileSidebarLink 
                                                key={item.href} 
                                                {...item} 
                                                onLinkClick={handleLinkClick}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {user && isAdmin && (
                            <>
                                <Separator className="my-4 opacity-50" />
                                <MobileSidebarLink
                                    href={isAdminRoute ? '/dashboard' : '/admin/overview'}
                                    label={isAdminRoute ? 'EXIT TERMINAL' : 'HQ ADMIN ACCESS'}
                                    icon={isAdminRoute ? LayoutDashboard : Settings}
                                    onLinkClick={handleLinkClick}
                                />
                            </>
                        )}
                    </nav>
                </ScrollArea>
                
                <div className="p-6 border-t bg-muted/20 space-y-3">
                    {!user ? (
                        <Button asChild className="w-full h-14 bg-primary text-primary-foreground font-black italic shadow-xl rounded-2xl">
                            <Link to="/login" onClick={handleLinkClick}>
                                <LogIn className="w-5 h-5 mr-2" /> PILOT LOGIN
                            </Link>
                        </Button>
                    ) : (
                        <Button onClick={handleSignOut} variant="outline" className="w-full h-12 font-black uppercase text-[10px] tracking-widest border-2">
                            <LogOut className="w-4 h-4 mr-2" /> DISCONNECT LINK
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MobileNav;