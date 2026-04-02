import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ShieldCheck, Search, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthGuard';
import { useUserRole } from '@/hooks/useUserRole';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const fetchUserRoles = async () => {
    const { data, error } = await supabase
        .from('user_roles')
        .select(`user_id, role_id, profiles (first_name, last_name, avatar_url)`);
    if (error) throw new Error(error.message);
    return (data as any[]).map(item => {
        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        return {
            user_id: item.user_id,
            role_id: item.role_id,
            name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : `User ${item.user_id.substring(0, 5)}...`,
            avatar: profile?.avatar_url,
        };
    });
};

const AdminPermission = () => {
    const { user } = useAuth();
    const { isAdmin: isCurrentUserAdmin, isLoading: isRoleLoading } = useUserRole();
    const queryClient = useQueryClient();
    const { data: rolesData, isLoading: isLoadingRoles, isError } = useQuery({ 
        queryKey: ['adminUserRoles'], 
        queryFn: fetchUserRoles 
    });

    const [searchTerm, setSearchTerm] = useState('');

    const mutation = useMutation({
        mutationFn: async ({ userId, isAdmin }: { userId: string, isAdmin: boolean }) => {
            const { data, error } = await supabase.functions.invoke('manage-user-roles', {
                body: { targetUserId: userId, action: isAdmin ? 'revoke' : 'grant' }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminUserRoles'] });
            queryClient.invalidateQueries({ queryKey: ['userRoles'] });
            toast.success(variables.isAdmin ? "Admin role revoked." : "Admin role granted.");
        },
        onError: (error: any) => {
            toast.error(`Failed to update role: ${error.message}`);
        }
    });

    const userMap = new Map<string, { name: string, isAdmin: boolean, avatar: string }>();
    rolesData?.forEach(role => {
        const entry = userMap.get(role.user_id) || { name: role.name, isAdmin: false, avatar: role.avatar };
        if (role.role_id === 'admin') entry.isAdmin = true;
        userMap.set(role.user_id, entry);
    });

    const filteredUsers = Array.from(userMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm));

    if (isLoadingRoles || isRoleLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-mono">Synchronizing RBAC Registry...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
                        <ShieldCheck className="w-10 h-10 mr-3 text-primary" /> Personnel Permissions
                    </h1>
                    <p className="text-lg text-muted-foreground mt-1">Manage administrative access and regional personnel roles.</p>
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-l-4 border-primary bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Your Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12 border-2 border-primary">
                                <AvatarFallback className="bg-primary text-primary-foreground font-bold">YOU</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg">{isCurrentUserAdmin ? 'Super Administrator' : 'Standard Pilot'}</p>
                                <Badge variant={isCurrentUserAdmin ? 'default' : 'secondary'} className="mt-1">
                                    {isCurrentUserAdmin ? 'ROOT ACCESS' : 'RESTRICTED'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Personnel Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name or User ID..." 
                                className="pl-10 h-12"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">User Role Registry</CardTitle>
                    <CardDescription>Granting admin status allows users full access to all data tables and system settings.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isError ? (
                        <div className="p-10 text-center space-y-2">
                            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                            <p className="text-destructive font-bold">Failed to load permissions data.</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-20 text-center border-t text-muted-foreground italic">
                            No personnel found matching your search.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[80px]"></TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead className="hidden lg:table-cell">User ID (UUID)</TableHead>
                                        <TableHead className="text-center">Current Role</TableHead>
                                        <TableHead className="text-right px-6">Administrative Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u) => (
                                        <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="pl-6">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={u.avatar} />
                                                    <AvatarFallback className="bg-secondary font-bold">{u.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-bold text-lg">{u.name}</TableCell>
                                            <TableCell className="hidden lg:table-cell font-mono text-[10px] text-muted-foreground">
                                                {u.id}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge 
                                                    variant={u.isAdmin ? 'default' : 'secondary'} 
                                                    className={u.isAdmin ? 'bg-primary text-primary-foreground font-black px-3' : 'px-3'}
                                                >
                                                    {u.isAdmin ? 'ADMIN' : 'PILOT'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Button 
                                                    variant={u.isAdmin ? 'outline' : 'default'} 
                                                    size="sm"
                                                    className={u.isAdmin ? 'border-destructive text-destructive hover:bg-destructive hover:text-white' : ''}
                                                    disabled={mutation.isPending || u.id === user?.id}
                                                    onClick={() => mutation.mutate({ userId: u.id, isAdmin: u.isAdmin })}
                                                >
                                                    {mutation.isPending && mutation.variables?.userId === u.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : null}
                                                    {u.isAdmin ? 'Revoke Admin' : 'Promote to Admin'}
                                                </Button>
                                                {u.id === user?.id && (
                                                    <p className="text-[10px] text-muted-foreground mt-1 italic">Cannot modify self</p>
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
        </div>
    );
};

export default AdminPermission;