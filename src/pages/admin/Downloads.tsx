import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, Edit, Trash2, PlusCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDownloads, DownloadItem } from '@/hooks/useDownloads';
import DownloadForm from '@/components/admin/DownloadForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const AdminDownloads = () => {
  const { downloads, isLoading, isError, deleteDownload, isDeleting } = useDownloads();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<DownloadItem | undefined>(undefined);

  const handleEdit = (item: DownloadItem) => {
    setEditingDownload(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingDownload(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteDownload(id);
      toast.success(`Download '${title}' deleted successfully.`);
    } catch (error) {
      toast.error(`Failed to delete download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <Download className="w-6 h-6 mr-2 text-primary" /> Downloads Content Management
          </CardTitle>
          <CardDescription>Manage files available for download (checklists, manuals, plugins).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex justify-end">
            <Button onClick={handleCreate}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add New Download
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-destructive">Error loading downloads data.</p>
          ) : downloads.length === 0 ? (
            <p className="text-muted-foreground">No download links found. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloads.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center w-fit">
                            <Tag className="w-3 h-3 mr-1" /> {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {item.file_url}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isDeleting}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will permanently delete the download link for 
                                        <span className="font-semibold mx-1">{item.title}</span>.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(item.id, item.title)}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Delete'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <DownloadForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialData={editingDownload} 
      />
    </div>
  );
};

export default AdminDownloads;