import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Edit, Globe, Eye, AlertCircle, PlusCircle, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllContent, DynamicContent } from '@/hooks/useContent';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminContent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: dbContent, isLoading, isError } = useQuery<DynamicContent[]>({
    queryKey: ['allDynamicContent'],
    queryFn: fetchAllContent,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const { error } = await supabase.from('content').delete().eq('id', id);
        if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['allDynamicContent'] });
        toast.success("Page deleted successfully.");
    }
  });

  const handleCreate = () => {
      const newSlug = window.prompt("Enter URL slug for new page (e.g. 'training-guide'):");
      if (newSlug) {
          navigate(`/admin/content/edit/${newSlug.toLowerCase().trim()}`);
      }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center italic uppercase text-primary">
                <Globe className="w-10 h-10 mr-3" /> Content Engine
            </h1>
            <p className="text-lg text-muted-foreground mt-1">Manage technical manuals, flight guides, and all public-facing site copy.</p>
          </div>
          <Button onClick={handleCreate} className="h-12 px-6 font-black italic shadow-lg rounded-xl">
              <PlusCircle className="w-5 h-5 mr-2" /> CREATE NEW PAGE
          </Button>
      </header>

      <Card className="border-t-4 border-primary">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing content repository...</p>
            </div>
          ) : isError ? (
            <div className="p-10 text-center space-y-2">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                <p className="text-destructive font-bold">Failed to load content list.</p>
            </div>
          ) : !dbContent || dbContent.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                  <Globe className="w-12 h-12 text-muted-foreground opacity-20 mx-auto" />
                  <p className="text-muted-foreground italic">No dynamic pages configured yet.</p>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[200px]">URL Path</TableHead>
                    <TableHead>Public Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>System Integrity</TableHead>
                    <TableHead className="text-right pr-6">Administrative Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dbContent.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 group">
                      <TableCell className="font-mono text-sm text-primary font-bold py-4">/{item.slug}</TableCell>
                      <TableCell className="font-bold text-base">{item.title}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600 font-black italic text-[9px] px-2 h-5 shadow-sm">PUBLISHED</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground flex items-center mt-3">
                        <ShieldCheck className="w-3 h-3 mr-1 text-green-500" /> Verified {new Date(item.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end space-x-2">
                            <Button asChild variant="outline" size="sm" className="h-8">
                                <Link to={`/${item.slug}`} target="_blank">
                                    <Eye className="w-4 h-4 mr-1.5" /> VIEW
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="h-8 font-bold">
                                <Link to={`/admin/content/edit/${item.slug}`}>
                                    <Edit className="w-4 h-4 mr-1.5" /> EDIT SOURCE
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={deleteMutation.isPending}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Page Deletion</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the page <span className="font-bold text-foreground">/{item.slug}</span> and all its contents. This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abort</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} className="bg-destructive hover:bg-destructive/90">
                                            DELETE PERMANENTLY
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <footer className="flex justify-center pt-6">
          <div className="p-4 bg-muted/30 border rounded-2xl flex items-center space-x-4 max-w-lg text-center">
              <div className="p-2 bg-primary/10 rounded-lg"><PlusCircle className="w-4 h-4 text-primary" /></div>
              <p className="text-xs font-medium text-muted-foreground">Pro-Tip: Use the "EDIT SOURCE" button to manage high-fidelity HTML templates for operational documents.</p>
          </div>
      </footer>
    </div>
  );
};

export default AdminContent;