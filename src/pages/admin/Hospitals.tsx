import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Loader2, Edit, Trash2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHemsData } from '@/hooks/useHemsData';
import { useHospitalManagement } from '@/hooks/useHospitalManagement';
import { useHospitalScenery } from '@/hooks/useHospitalScenery';
import HospitalForm from '@/components/admin/HospitalForm';
import HospitalSceneryForm from '@/components/admin/HospitalSceneryForm';
import { Hospital } from '@/data/hemsData';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const AdminHospitals = () => {
  const { hospitals, isLoading: isHospitalsLoading, isError: isHospitalsError } = useHemsData();
  const { deleteHospital, isDeleting } = useHospitalManagement();
  const { sceneryQuery } = useHospitalScenery();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSceneryFormOpen, setIsSceneryFormOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | undefined>(undefined);

  const isLoading = isHospitalsLoading || sceneryQuery.isLoading;
  const sceneryMap = new Map(sceneryQuery.data?.map(s => [s.hospital_id, s]) || []);

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsFormOpen(true);
  };

  const handleEditScenery = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsSceneryFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedHospital(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteHospital(id);
      toast.success(`Hospital ${name} deleted successfully.`);
    } catch (error) {
      toast.error(`Failed to delete hospital: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center italic uppercase text-primary">
                <MapPin className="w-10 h-10 mr-3" /> Facility Registry
            </h1>
            <p className="text-lg text-muted-foreground mt-1">Manage regional hospitals, landing zones, and visual briefing assets.</p>
          </div>
          <Button onClick={handleCreate} className="h-12 px-6 font-black italic shadow-lg rounded-xl">
              <PlusCircle className="w-5 h-5 mr-2" /> ADD NEW FACILITY
          </Button>
      </header>

      <Card className="border-t-4 border-primary overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isHospitalsError ? (
            <p className="p-10 text-destructive text-center font-bold">Error synchronizing hospital data link.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Facility Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Trauma</TableHead>
                    <TableHead className="text-center">Visual Assets</TableHead>
                    <TableHead className="text-right">Coordinates</TableHead>
                    <TableHead className="text-right pr-6">Management</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((h) => {
                    const scenery = sceneryMap.get(h.id);
                    return (
                        <TableRow key={h.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-bold text-base py-4">{h.name}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{h.city}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{h.faaIdentifier || 'NO-ID'}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                {h.isTraumaCenter ? (
                                    <Badge className="bg-red-600 font-black italic text-[9px] px-2 h-5 shadow-sm">
                                        LVL-{h.traumaLevel || 1}
                                    </Badge>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground font-bold opacity-30">--</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                {scenery ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center justify-center space-x-1 cursor-help">
                                                <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 text-[9px] font-black italic">
                                                    {scenery.image_urls.length} PHOTOS
                                                </Badge>
                                                {scenery.zip_url && <Badge className="bg-primary text-primary-foreground text-[8px] h-4">ZIP</Badge>}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="text-xs">{scenery.description || 'Assets active.'}</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <span className="text-[10px] font-bold text-muted-foreground opacity-30 italic">MISSING DATA</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                                {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                            </TableCell>
                            <TableCell className="text-right space-x-2 pr-6">
                                <Button variant="outline" size="sm" onClick={() => handleEditScenery(h)} className="h-8 text-[10px] font-bold">
                                    <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> MEDIA
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(h)} className="h-8 text-[10px] font-bold">
                                    <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={isDeleting}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Permanent Removal</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete <span className="font-bold text-foreground">{h.name}</span> and all associated visual assets. This action is irreversible.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Abort</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(h.id, h.name)} className="bg-destructive hover:bg-destructive/90">
                                                CONFIRM DELETE
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <HospitalForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialData={selectedHospital} 
      />

      {selectedHospital && (
        <HospitalSceneryForm 
            open={isSceneryFormOpen}
            onOpenChange={setIsSceneryFormOpen}
            hospital={selectedHospital}
            initialData={sceneryMap.get(selectedHospital.id)}
        />
      )}
    </div>
  );
};

export default AdminHospitals;