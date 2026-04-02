import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Loader2, Edit, Trash2, PlusCircle, PlaneTakeoff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHemsData } from '@/hooks/useHemsData';
import { useHemsBaseManagement } from '@/hooks/useHemsBaseManagement';
import HemsBaseForm from '@/components/admin/HemsBaseForm';
import { HemsBase } from '@/data/hemsData';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminCrewBases = () => {
  const { bases, isLoading, isError } = useHemsData();
  const { deleteHemsBase, isDeleting } = useHemsBaseManagement();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBase, setEditingBase] = useState<HemsBase | undefined>(undefined);

  const handleEdit = (base: HemsBase) => {
    setEditingBase(base);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingBase(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteHemsBase(id);
      toast.success(`HEMS Base ${name} deleted successfully.`);
    } catch (error) {
      toast.error(`Failed to delete HEMS base: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-primary" /> Crew Bases Management
          </CardTitle>
          <CardDescription>Manage HEMS base locations, contact information, and operational status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex justify-end">
            <Button onClick={handleCreate}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add New Base
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-destructive">Error loading HEMS base data.</p>
          ) : bases.length === 0 ? (
            <p className="text-muted-foreground">No HEMS bases found. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>FAA ID</TableHead>
                    <TableHead>Assigned Aircraft</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bases.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.location}</TableCell>
                      <TableCell className="font-mono text-sm">{b.faaIdentifier || 'N/A'}</TableCell>
                      <TableCell className="font-semibold flex items-center">
                        <PlaneTakeoff className="w-4 h-4 mr-1 text-muted-foreground" />
                        {b.assignedHelicopterRegistration || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(b)}>
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
                                        This action cannot be undone. This will permanently delete the HEMS Base 
                                        <span className="font-semibold mx-1">{b.name}</span> 
                                        and remove it from all planning options.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(b.id, b.name)}
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
      
      <HemsBaseForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialData={editingBase} 
      />
    </div>
  );
};

export default AdminCrewBases;