import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepProps, PatientGender } from './types.ts';
import { ArrowLeft, ArrowRight, HeartPulse, FileText, User, Zap, Scale, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { callTacticalAnalyst } from '@/integrations/dispatch/api';

const Step3Patient: React.FC<StepProps> = ({ formState, updateFormState, onNext, onBack, bases }) => {
    const { patientAge, patientGender, patientWeightLbs, patientDetails, medicalResponse, selectedBaseId, missionType } = formState;
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        const base = bases.find(b => b.id === selectedBaseId);
        const result = await callTacticalAnalyst('GENERATE_SCENARIO', {
            type: missionType,
            region: base?.location || "Regional Sector"
        });

        if (result) {
            updateFormState(result);
            toast.success("AI Dispatch Scenario Synchronized.");
        } else {
            toast.error("AI Uplink Failed. Using standard protocol.");
        }
        setIsGenerating(false);
    };

    const handleNextStep = () => {
        if (!patientDetails || !medicalResponse) {
            toast.error("Please provide patient details and medical response notes.");
            return;
        }
        onNext();
    };

    const genderOptions: PatientGender[] = ['Male', 'Female', 'Other'];

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold mb-4">
                    <HeartPulse className="w-5 h-5 text-primary" />
                    <span>Clinical Data Management</span>
                </div>
                
                <Button 
                    onClick={handleAiGenerate} 
                    variant="default" 
                    className="w-full h-14 font-black italic uppercase shadow-xl bg-primary text-primary-foreground"
                    disabled={isGenerating}
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
                    Request AI Tactical Dispatch Briefing
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="patientAge" className="flex items-center">
                            <User className="w-4 h-4 mr-1" /> Age
                        </Label>
                        <Input id="patientAge" type="number" value={patientAge} onChange={(e) => updateFormState({ patientAge: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="patientGender" className="flex items-center">
                            <User className="w-4 h-4 mr-1" /> Gender
                        </Label>
                        <Select value={patientGender} onValueChange={(val) => updateFormState({ patientGender: val as PatientGender })}>
                            <SelectTrigger id="patientGender"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                            <SelectContent>
                                {genderOptions.map(gender => <SelectItem key={gender} value={gender}>{gender}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="patientWeightLbs" className="flex items-center">
                            <Scale className="w-4 h-4 mr-1" /> Weight (LB)
                        </Label>
                        <Input id="patientWeightLbs" type="number" value={patientWeightLbs} onChange={(e) => updateFormState({ patientWeightLbs: e.target.value })} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="patientDetails" className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" /> Clinical Summary / Mechanism
                    </Label>
                    <Textarea
                        id="patientDetails"
                        rows={4}
                        value={patientDetails}
                        onChange={(e) => updateFormState({ patientDetails: e.target.value })}
                        className="italic font-medium leading-relaxed"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="medicalResponse" className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" /> Stabilizing Interventions
                    </Label>
                    <Textarea
                        id="medicalResponse"
                        rows={4}
                        value={medicalResponse}
                        onChange={(e) => updateFormState({ medicalResponse: e.target.value })}
                        className="italic font-medium leading-relaxed"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={onBack} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                <Button onClick={handleNextStep}>Next: Performance Specs <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </CardFooter>
        </Card>
    );
};

export default Step3Patient;