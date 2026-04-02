import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Loader2, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ProfileForm from '@/components/admin/ProfileForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthGuard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminProfiles = () => {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const { data: profiles, isLoading, isError } = useProfiles();
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Mutation to delete a user via the new Edge Function
    const deleteMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            const { data, error } = await supabase.functions.invoke('manage-users', {
                body: { targetUserId }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
            queryClient.invalidateQueries({ queryKey: ['adminUserRoles'] });
            toast.success("User and profile deleted permanently.");
        },
        onError: (error: any) => {
            toast.error(`Deletion failed: ${error.message}`);
        }
    });

    const getInitials = (profile: Profile) => {
        return (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');
    };

    const handleEdit = (profile: Profile) => {
        setSelectedProfile(profile);
        setIsFormOpen(true);
    };

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl flex items-center">
                        <User className="w-6 h-6 mr-2 text-primary" /> Profile Management
                    </CardTitle>
                    <CardDescription>Manage detailed user profiles (names, contact info, avatars).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : isError ? (
                        <p className="text-destructive">Error loading profile data.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Avatar</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profiles?.map((profile) => (
                                        <TableRow key={profile.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={profile.avatar_url || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
                                                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">{getInitials(profile)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs max-w-[150px] truncate text-muted-foreground">{profile.id}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(profile.updated_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(profile)}>
                                                    <Edit className="w-4 h-4 mr-1" /> Edit
                                                </Button>

                                                {profile.id !== currentUser?.id && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" disabled={deleteMutation.isPending}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center text-destructive">
                                                                    <ShieldAlert className="w-5 h-5 mr-2" /> 
                                                                    Irreversible Action
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the account for <span className="font-bold text-foreground">{profile.first_name} {profile.last_name}</span>.
                                                                    The user will be logged out and all their mission data and settings will be removed.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    onClick={() => deleteMutation.mutate(profile.id)}
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                >
                                                                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deletion'}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedProfile && (
                <ProfileForm 
                    open={isFormOpen} 
                    onOpenChange={setIsFormOpen} 
                    profile={selectedProfile} 
                />
            )}
        </div>
    );
};

export default AdminProfiles;