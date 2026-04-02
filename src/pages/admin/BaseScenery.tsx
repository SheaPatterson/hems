import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHemsData } from '@/hooks/useHemsData';
import { useBaseScenery, BaseScenery } from '@/hooks/useBaseScenery';
import { HemsBase } from '@/data/hemsData';
import BaseSceneryForm from '@/components/admin/BaseSceneryForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Define a combined type for display
interface BaseSceneryRow extends HemsBase {
    scenery: BaseScenery | undefined;
}

const AdminBaseScenery = () => {
  const { bases, isLoading: isBasesLoading, isError: isBasesError } = useHemsData();
  const { sceneryQuery, deleteScenery, isDeleting } = useBaseScenery();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBase, setSelectedBase] = useState<HemsBase | undefined>(undefined);
  const [initialSceneryData, setInitialSceneryData] = useState<BaseScenery | undefined>(undefined);

  const isLoading = isBasesLoading || sceneryQuery.isLoading;
  const isError = isBasesError || sceneryQuery.isError;
  const scenery = sceneryQuery.data || [];

  // Map scenery data for quick lookup
  const sceneryMap = new Map(scenery.map(s => [s.base_id, s]));

  const combinedData: BaseSceneryRow[] = bases.map(b => ({
    ...b,
    scenery: sceneryMap.get(b.id),
  }));

  const handleOpenForm = (base: HemsBase, existingScenery?: BaseScenery) => {
    setSelectedBase(base);
    setInitialSceneryData(existingScenery);
    setIsFormOpen(true);
  };

  const handleDelete = async (sceneryId: string) => {
    await deleteScenery(sceneryId);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-primary" /> HEMS Base Scenery Management
          </CardTitle>
          <CardDescription>Manage simulator scenery files and landing zone details for HEMS bases.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            
            {/* The upload button placeholder was removed as file upload functionality is not yet implemented. */}

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : isError ? (
                <p className="text-destructive">Error loading base or scenery data.</p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Base Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Scenery Status</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {combinedData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell>{row.location}</TableCell>
                                    <TableCell>
                                        <Badge variant={row.scenery ? 'default' : 'secondary'} className={row.scenery ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}>
                                            {row.scenery ? 'Configured' : 'Missing'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                        {row.scenery?.description || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {row.scenery ? (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => handleOpenForm(row, row.scenery)}>
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
                                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently remove the scenery link for <span className="font-semibold">{row.name}</span>.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => handleDelete(row.scenery!.id)}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Delete'}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        ) : (
                                            <Button size="sm" onClick={() => handleOpenForm(row)}>
                                                <PlusCircle className="w-4 h-4 mr-1" /> Add
                                            </Button>
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
      
      {selectedBase && (
        <BaseSceneryForm 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          base={selectedBase}
          initialData={initialSceneryData}
        />
      )}
    </div>
  );
};

export default AdminBaseScenery;