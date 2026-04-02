import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2, PlusCircle, Eye, Image as ImageIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHemsData } from '@/hooks/useHemsData';
import { useHospitalScenery, HospitalScenery } from '@/hooks/useHospitalScenery';
import { Hospital as IHospital } from '@/data/hemsData';
import HospitalSceneryForm from '@/components/admin/HospitalSceneryForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

// Define a combined type for display
interface HospitalSceneryRow extends IHospital {
    scenery: HospitalScenery | undefined;
}

const AdminHospitalScenery = () => {
  const { hospitals, isLoading: isHospitalsLoading, isError: isHospitalsError } = useHemsData();
  const { sceneryQuery, deleteScenery, isDeleting } = useHospitalScenery();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<IHospital | undefined>(undefined);
  const [initialSceneryData, setInitialSceneryData] = useState<HospitalScenery | undefined>(undefined);

  const isLoading = isHospitalsLoading || sceneryQuery.isLoading;
  const isError = isHospitalsError || sceneryQuery.isError;
  const scenery = sceneryQuery.data || [];

  // Map scenery data for quick lookup
  const sceneryMap = new Map(scenery.map(s => [s.hospital_id, s]));

  // Combine hospital data with scenery data
  const combinedData: HospitalSceneryRow[] = hospitals.map(h => ({
    ...h,
    scenery: sceneryMap.get(h.id),
  }));

  const handleOpenForm = (hospital: IHospital, existingScenery?: HospitalScenery) => {
    setSelectedHospital(hospital);
    setInitialSceneryData(existingScenery);
    setIsFormOpen(true);
  };

  const handleDelete = async (sceneryId: string) => {
    await deleteScenery(sceneryId);
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader 
        title="Hospital Scenery Management"
        description="Manage simulator scenery files and landing zone details for hospitals."
        icon={ImageIcon}
      />
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" /> Facility Asset Registry
            </CardTitle>
            <Button onClick={() => handleOpenForm(hospitals[0] || {} as IHospital)} disabled={hospitals.length === 0}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add New Scenery
            </Button>
          </div>
          <CardDescription>Use the 'View' button to see the public gallery page for each facility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : isError ? (
                <p className="text-destructive">Error loading hospital or scenery data.</p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hospital Name</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead className="text-center">Assets</TableHead>
                                <TableHead>Description Snippet</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {combinedData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell>{row.city}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={row.scenery ? 'default' : 'secondary'} className={row.scenery ? 'bg-green-600 hover:bg-green-700 text-[10px] h-5' : 'bg-yellow-600 hover:bg-yellow-700 text-[10px] h-5'}>
                                            {row.scenery ? `${row.scenery.image_urls.length} Photos` : 'Missing'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                        {row.scenery?.description || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`/hospital-scenery/${row.id}`}>
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        
                                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(row, row.scenery)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        
                                        {row.scenery && (
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
      
      {selectedHospital && (
        <HospitalSceneryForm 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          hospital={selectedHospital}
          initialData={initialSceneryData}
        />
      )}
    </div>
  );
};

export default AdminHospitalScenery;