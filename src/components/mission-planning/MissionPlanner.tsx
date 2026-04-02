import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthGuard';
import { generateMissionReport } from "@/utils/missionGenerator";
import { CrewMember as CoreCrewMember, Waypoint as CoreWaypoint, PatientGender as CorePatientGender } from "@/data/hemsData";
import { playDispatchTones } from '@/utils/audioService';

import Step1Details from './Step1Details.tsx';
import Step2Crew from './Step2Crew.tsx';
import Step3Patient from './Step3Patient.tsx';
import Step4FlightCalculation from './Step4FlightCalculation.tsx';
import { MissionFormState, initialMissionState, MissionPlannerProps, MOCK_SCENE_LOCATION } from './types.ts';

const MissionPlanner: React.FC<MissionPlannerProps> = ({ hospitals, bases, helicopters, initialState }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Initialize state with defaults, then override with any provided initial data
  const [formState, setFormState] = useState<MissionFormState>({
      ...initialMissionState,
      ...initialState
  });

  const [currentStep, setCurrentStep] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 'details', label: '1. Details', component: Step1Details },
    { id: 'crew', label: '2. Crew', component: Step2Crew },
    { id: 'patient', label: '3. Patient Info', component: Step3Patient },
    { id: 'calculation', label: '4. Flight Plan', component: Step4FlightCalculation },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const updateFormState = (updates: Partial<MissionFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    const { missionType, selectedBaseId, selectedHelicopter, selectedOriginId, selectedDestinationId, selectedSceneLocation, selectedFinalHospitalId, crew, patientAge, patientGender, patientWeightLbs, patientDetails, medicalResponse, flightMetrics, waypoints } = formState;

    const base = bases.find(b => b.id === selectedBaseId);
    if (!base || !selectedHelicopter || !flightMetrics) {
        toast.error("Incomplete mission data.");
        setIsSubmitting(false);
        return;
    }

    const callsign = base.name.toUpperCase();

    let pickup: any;
    let destination: any;

    if (missionType === "Hospital Transfer") {
        pickup = hospitals.find(h => h.id === selectedOriginId);
        destination = hospitals.find(h => h.id === selectedDestinationId);
    } else { 
        pickup = selectedSceneLocation || MOCK_SCENE_LOCATION;
        destination = hospitals.find(h => h.id === selectedFinalHospitalId);
    }

    try {
        const coreCrew = crew as CoreCrewMember[];
        const report = generateMissionReport(missionType, base, selectedHelicopter, coreCrew, base, pickup, patientDetails, medicalResponse);

        report.callsign = callsign;
        report.waypoints = waypoints as CoreWaypoint[];
        report.destination = destination;
        report.tracking.timeEnrouteMinutes = flightMetrics.estimatedFlightTimeMinutes;

        const missionData = {
            mission_id: report.missionId,
            callsign: report.callsign,
            user_id: user.id,
            mission_type: report.type,
            hems_base: report.hemsBase,
            helicopter: report.helicopter,
            crew: report.crew,
            origin: report.origin,
            destination: report.destination,
            patient_age: patientAge === '' ? null : Number(patientAge),
            patient_gender: patientGender as CorePatientGender,
            patient_weight_lbs: patientWeightLbs === '' ? null : Number(patientWeightLbs),
            patient_details: patientDetails,
            medical_response: medicalResponse,
            waypoints: report.waypoints,
            tracking: report.tracking,
            live_data: report.liveData,
            status: 'active'
        };

        const { data, error } = await supabase.from('missions').insert([missionData]).select('mission_id').single();
        if (error) throw error;

        playDispatchTones();

        toast.success(`Mission ${report.missionId} dispatched! Switching to live tracking...`);
        navigate(`/tracking/${data.mission_id}`);

    } catch (error: any) {
        toast.error(`Dispatch failed: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
        <CardHeader><CardTitle className="text-3xl font-extrabold text-primary flex items-center"><Zap className="w-6 h-6 mr-2" /> HEMS Mission Planner</CardTitle></CardHeader>
        <CardContent>
            <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {steps.map((step) => (
                        <TabsTrigger key={step.id} value={step.id} disabled={isSubmitting}>{step.label}</TabsTrigger>
                    ))}
                </TabsList>
                {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-lg font-medium">Transmitting Flight Plan...</p>
                    </div>
                ) : (
                    steps.map((step, index) => {
                        const StepComponent = step.component;
                        return (
                            <TabsContent key={step.id} value={step.id} className="mt-6">
                                <StepComponent formState={formState} updateFormState={updateFormState} onNext={handleNext} onBack={handleBack} hospitals={hospitals} bases={bases} helicopters={helicopters} isFirstStep={index === 0} isLastStep={index === steps.length - 1} />
                            </TabsContent>
                        );
                    })
                )}
            </Tabs>
        </CardContent>
    </Card>
  );
};

export default MissionPlanner;