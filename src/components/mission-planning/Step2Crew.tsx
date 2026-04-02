import React from 'react';
import { StepProps, CrewMember, CREW_ROLES } from './types.ts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Users, User, CheckCircle, AlertTriangle, PlusCircle, Trash2, Zap, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { autoGenerateCrew } from '@/utils/mockDataGenerator';
import { useAuth } from '@/components/AuthGuard';
import { cn } from '@/lib/utils';

const Step2Crew: React.FC<StepProps> = ({ formState, updateFormState, onNext, onBack, isFirstStep }) => {
    const { crew } = formState;
    const { user } = useAuth();

    const handleAutoGenerate = () => {
        if (!user) {
            toast.error("You must be logged in to be assigned as the Pilot.");
            return;
        }
        const generatedCrew = autoGenerateCrew(user);
        updateFormState({ crew: generatedCrew });
        toast.success("Crew auto-generated. You are assigned as Pilot.");
    };

    const handleAddMember = () => {
        updateFormState({
            crew: [...crew, { id: Date.now().toString(), role: '', name: '' }]
        });
    };

    const handleUpdateMember = (id: string, field: 'role' | 'name', value: string) => {
        updateFormState({
            crew: crew.map(member => 
                member.id === id ? { ...member, [field]: value } : member
            )
        });
    };

    const handleRemoveMember = (id: string) => {
        updateFormState({
            crew: crew.filter(member => member.id !== id)
        });
    };

    const isCrewValid = crew.length > 0 && crew.every(m => m.role && m.name);

    const handleNextStep = () => {
        if (!isCrewValid) {
            toast.error("Please ensure all crew members have a name and role assigned.");
            return;
        }
        onNext();
    };

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Assign Crew Roster</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleAutoGenerate} variant="default" disabled={!user}>
                        <Zap className="w-4 h-4 mr-2" /> Auto-Generate Crew (Pilot: You)
                    </Button>
                    <Button onClick={handleAddMember} variant="outline">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Crew Member Manually
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {crew.map((member: CrewMember) => {
                        const isPilot = member.id === user?.id;
                        const isComplete = member.name && member.role;

                        return (
                            <Card 
                                key={member.id} 
                                className={cn(
                                    "shadow-md transition-all",
                                    isPilot ? "border-2 border-primary/50 bg-primary/5" : ""
                                )}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                            <span className="font-semibold">{isPilot ? 'Pilot (You)' : 'Crew Member'}</span>
                                        </div>
                                        {!isPilot && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="w-8 h-8 shrink-0 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor={`name-${member.id}`}>Name</Label>
                                        <Input
                                            id={`name-${member.id}`}
                                            placeholder="John Doe"
                                            value={member.name}
                                            onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                                            disabled={isPilot} // Pilot name is fixed
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor={`role-${member.id}`} className="flex items-center">
                                            <Briefcase className="w-4 h-4 mr-1 text-muted-foreground" /> Role
                                        </Label>
                                        {isPilot ? (
                                            <Input value="Pilot" readOnly disabled />
                                        ) : (
                                            <Select
                                                value={member.role}
                                                onValueChange={(val) => handleUpdateMember(member.id, 'role', val)}
                                            >
                                                <SelectTrigger id={`role-${member.id}`}>
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CREW_ROLES.filter(role => role !== 'Pilot').map(role => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                    
                                    <div className="pt-2 text-sm flex items-center justify-end">
                                        {isComplete ? (
                                            <span className="text-green-600 flex items-center font-medium">
                                                <CheckCircle className="w-4 h-4 mr-1" /> Roster Complete
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 flex items-center font-medium">
                                                <AlertTriangle className="w-4 h-4 mr-1" /> Missing Details
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={onBack} disabled={isFirstStep} variant="outline" className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNextStep} disabled={!isCrewValid} className="flex items-center">
                    Next: Patient Info <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default Step2Crew;