import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaneTakeoff, Loader2, Edit, Trash2, PlusCircle, Fuel, Gauge, Zap, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHemsData } from '@/hooks/useHemsData';
import { useHelicopterManagement } from '@/hooks/useHelicopterManagement';
import HelicopterForm from '@/components/admin/HelicopterForm';
import { Helicopter } from '@/data/hemsData';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const AdminAircraft = () => {
  const { helicopters, isLoading, isError } = useHemsData();
  const { deleteHelicopter, isDeleting } = useHelicopterManagement();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHelicopter, setEditingHelicopter] = useState<Helicopter | undefined>(undefined);

  const handleEdit = (helicopter: Helicopter) => {
    setEditingHelicopter(helicopter);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingHelicopter(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, registration: string) => {
    try {
      await deleteHelicopter(id);
      toast.success(`Helicopter ${registration} deleted successfully.`);
    } catch (error) {
      toast.error(`Failed to delete helicopter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <PlaneTakeoff className="w-6 h-6 mr-2 text-primary" /> Aircraft Management
          </CardTitle>
          <CardDescription>Manage helicopter fleet details, maintenance schedules, and specifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex justify-end">
            <Button onClick={handleCreate}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add New Aircraft
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <p className="text-destructive">Error loading aircraft data.</p>
          ) : helicopters.length === 0 ? (
            <p className="text-muted-foreground">No aircraft found. Add one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Max Fuel</TableHead>
                    <TableHead className="text-right">Cruise Speed</TableHead>
                    <TableHead className="text-right">Burn Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {helicopters.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-mono font-semibold">{h.registration}</TableCell>
                      <TableCell className="font-medium">{h.model}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                            variant={h.maintenanceStatus === 'AOG' ? 'destructive' : 'default'}
                            className="font-black italic text-[10px] px-3 h-5 shadow-sm flex items-center justify-center w-20 mx-auto"
                        >
                            {h.maintenanceStatus === 'AOG' ? <Wrench className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                            {h.maintenanceStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end">
                        <Fuel className="w-4 h-4 mr-1 text-muted-foreground" /> {h.fuelCapacityLbs.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end">
                        <Gauge className="w-4 h-4 mr-1 text-muted-foreground" /> {h.cruiseSpeedKts} Kts
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end">
                        <Zap className="w-4 h-4 mr-1 text-muted-foreground" /> {h.fuelBurnRateLbHr} Lbs/Hr
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(h)}>
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
                                        This action cannot be undone. This will permanently delete the aircraft 
                                        <span className="font-mono font-semibold mx-1">{h.registration}</span> 
                                        and remove it from all planning options.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDelete(h.id, h.registration)}
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
      
      <HelicopterForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialData={editingHelicopter} 
      />
    </div>
  );
};

export default AdminAircraft;