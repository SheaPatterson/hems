import React, { useState, useEffect, useCallback } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Search, FileText, History, Users, MapPin, Hospital, Code, Download, MessageSquare, LayoutDashboard, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAllContent } from '@/hooks/useAllContent'; // Use the new hook
import { useMissions, HistoricalMission } from '@/hooks/useMissions';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import { useHemsData } from '@/hooks/useHemsData';
import { useAuth } from './AuthGuard';
import { Button } from '@/components/ui/button'; // Import Button

interface SearchResult {
    id: string;
    type: 'content' | 'mission' | 'pilot' | 'base' | 'hospital' | 'plugin' | 'download' | 'community';
    label: string;
    icon: React.ElementType;
    url: string;
}

const GlobalSearch: React.FC = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch data for search
    const { data: contentPages } = useAllContent(); // Use the new hook
    const { data: missions } = useMissions(user?.id);
    const { data: profiles } = useProfiles();
    const { bases, hospitals } = useHemsData();

    // Combine all searchable data into a single array
    const allSearchResults = useCallback(() => {
        const results: SearchResult[] = [];

        // Dashboard & Planning
        results.push({ id: 'dashboard', type: 'content', label: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' });
        results.push({ id: 'mission-planner', type: 'content', label: 'Mission Dispatch Planner', icon: Zap, url: '/generate' });

        // Content Pages
        if (contentPages) {
            contentPages.forEach((page) => {
                results.push({
                    id: page.id,
                    type: 'content',
                    label: page.title,
                    icon: FileText,
                    url: `/${page.slug}`,
                });
            });
        }

        // Missions
        if (missions) {
            missions.forEach((mission: HistoricalMission) => {
                results.push({
                    id: mission.id,
                    type: 'mission',
                    label: `Mission: ${mission.missionId} (${mission.destination.name})`,
                    icon: History,
                    url: `/report/${mission.missionId}`,
                });
            });
        }

        // Pilots
        if (profiles) {
            profiles.forEach((profile: Profile) => {
                if (profile.first_name || profile.last_name) {
                    results.push({
                        id: profile.id,
                        type: 'pilot',
                        label: `Pilot: ${profile.first_name} ${profile.last_name}`,
                        icon: Users,
                        url: `/pilot-directory`, // Link to directory, not individual profile page
                    });
                }
            });
        }

        // HEMS Bases
        if (bases) {
            bases.forEach(base => {
                results.push({
                    id: base.id,
                    type: 'base',
                    label: `HEMS Base: ${base.name} (${base.location})`,
                    icon: MapPin,
                    url: `/helicopter-bases`,
                });
            });
        }

        // Hospitals
        if (hospitals) {
            hospitals.forEach(hospital => {
                results.push({
                    id: hospital.id,
                    type: 'hospital',
                    label: `Hospital: ${hospital.name} (${hospital.city})`,
                    icon: Hospital,
                    url: `/hospital-directory`,
                });
            });
        }

        // Other static links (Plugins, Downloads, Community, etc.)
        results.push({ id: 'plugins', type: 'plugin', label: 'Tactical Integration Hub', icon: Code, url: '/plugins' });
        results.push({ id: 'downloads', type: 'download', label: 'Resource Library', icon: Download, url: '/downloads' });
        results.push({ id: 'community', type: 'community', label: 'Crew Q&A Board', icon: MessageSquare, url: '/community' });
        results.push({ id: 'incident-reports', type: 'content', label: 'Safety Management System', icon: Shield, url: '/incident-reports' });


        return results;
    }, [contentPages, missions, profiles, bases, hospitals, user]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelect = (url: string) => {
        setOpen(false);
        navigate(url);
    };

    return (
        <>
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="relative">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
                <kbd className="absolute right-0 top-0 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:opacity-0 transition-opacity">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search the HEMS OPS-CENTER..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        {allSearchResults().map((result) => (
                            <CommandItem key={result.id} onSelect={() => handleSelect(result.url)} value={result.label}>
                                <result.icon className="mr-2 h-4 w-4" />
                                <span>{result.label}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Admin Tools">
                        {user && (
                            <>
                                <CommandItem onSelect={() => handleSelect('/admin/overview')} value="Admin Hub">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Admin Hub</span>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/admin/content')} value="Content Engine">
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Content Engine</span>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/admin/users')} value="User Management">
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>User Management</span>
                                </CommandItem>
                            </>
                        )}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
};

export default GlobalSearch;