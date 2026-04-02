import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Loader2, Shield, Search, Trash2, Mail, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageHeader from '@/components/PageHeader';

// Fetch users with their profiles and roles
const fetchUsersWithRoles = async () => {
    // We fetch profiles because we can't list auth.users directly client-side
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            id, 
            first_name, 
            last_name, 
            avatar_url, 
            email_public,
            updated_at
        `);

    if (error) throw new Error(error.message);

    // Fetch roles separately
    const { data: roles } = await supabase.from('user_roles').select('*');
    const adminIds = new Set(roles?.filter(r => r.role_id === 'admin').map(r => r.user_id));

    return profiles.map(p => ({
        ...p,
        isAdmin: adminIds.has(p.id),
        fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown Pilot',
    }));
};

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const { data: users, isLoading } = useQuery({ 
        queryKey: ['adminUsersMaster'], 
        queryFn: fetchUsersWithRoles 
    });

    // Role Toggle Mutation
    const roleMutation = useMutation({
        mutationFn: async ({ userId, action }: { userId: string, action: 'grant' | 'revoke' }) => {
            const { error } = await supabase.functions.invoke('manage-user-roles', {
                body: { targetUserId: userId, action }
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsersMaster'] });
            toast.success("User permissions updated successfully.");
        },
        onError: (err) => toast.error(`Role update failed: ${err.message}`)
    });

    // Delete User Mutation
    const deleteMutation = useMutation({
        mutationFn: async (targetUserId: string) => {
            const { error } = await supabase.functions.invoke('manage-users', {
                body: { targetUserId }
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsersMaster'] });
            setUserToDelete(null);
            toast.success("User account permanently deleted.");
        },
        onError: (err) => toast.error(`Deletion failed: ${err.message}`)
    });

    const filteredUsers = users?.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.id.includes(searchTerm) ||
        (u.email_public || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <PageHeader 
                title="User Command"
                description="Manage personnel, assign administrative privileges, and audit accounts."
                icon={Users}
                actions={
                    <div className="text-right">
                        <p className="text-sm font-bold">{users?.length || 0}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Users</p>
                    </div>
                }
            />

            <Card>
                <CardHeader className="pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, ID, or public email..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[60px]"></TableHead>
                                <TableHead>Pilot Identity</TableHead>
                                <TableHead className="hidden md:table-cell">System ID</TableHead>
                                <TableHead className="text-center">Role</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((u) => (
                                <TableRow key={u.id} className="hover:bg-muted/30">
                                    <TableCell className="pl-6">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={u.avatar_url || undefined} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {u.first_name?.[0]}{u.last_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{u.fullName}</span>
                                            {u.email_public && (
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Mail className="w-3 h-3 mr-1" /> {u.email_public}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell font-mono text-[10px] text-muted-foreground">
                                        {u.id}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {u.isAdmin ? (
                                            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                                                <ShieldCheck className="w-3 h-3 mr-1" /> ADMIN
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="font-mono text-muted-foreground">PILOT</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(u.id)}>
                                                    Copy User ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {u.id !== currentUser?.id && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => roleMutation.mutate({ userId: u.id, action: u.isAdmin ? 'revoke' : 'grant' })}>
                                                            <Shield className="w-4 h-4 mr-2" />
                                                            {u.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setUserToDelete(u.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!userToDelete} onOpenChange={(o) => !o && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account, their flight history, and their profile data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => userToDelete && deleteMutation.mutate(userToDelete)}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete User'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminUsers;