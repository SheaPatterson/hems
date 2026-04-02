import { User } from '@supabase/supabase-js';
import { CrewMember, PatientGender, CrewRole } from '@/components/mission-planning/types';

// Mock list of common crew names and roles
const MOCK_CREW_NAMES: { name: string; role: CrewRole }[] = [
    { name: "Sarah Connor", role: "Flight Nurse" },
    { name: "Kyle Reese", role: "Flight Paramedic" },
    { name: "T-800", role: "Flight Mechanic" },
    { name: "John Doe", role: "Flight Nurse" },
    { name: "Jane Smith", role: "Flight Paramedic" },
];

export const autoGenerateCrew = (currentUser: User): CrewMember[] => {
    // 1. Current user is always the Pilot
    const pilot: CrewMember = {
        id: currentUser.id,
        role: 'Pilot',
        name: currentUser.email?.split('@')[0] || 'Authenticated Pilot',
    };

    // 2. Select two random, unique crew members for Flight Nurse and Flight Paramedic
    const requiredRoles: CrewRole[] = ['Flight Nurse', 'Flight Paramedic'];
    const selectedCrew: CrewMember[] = [];
    const usedIndices = new Set<number>();

    requiredRoles.forEach(role => {
        let randomIndex;
        // Find a mock crew member that matches the required role and hasn't been used
        const availableMocks = MOCK_CREW_NAMES.map((m, index) => ({ ...m, index }))
            .filter(m => m.role === role && !usedIndices.has(m.index));

        if (availableMocks.length > 0) {
            randomIndex = availableMocks[Math.floor(Math.random() * availableMocks.length)].index;
            usedIndices.add(randomIndex);
            
            selectedCrew.push({
                id: `mock-${Date.now()}-${role.replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 9)}`,
                role: role,
                name: MOCK_CREW_NAMES[randomIndex].name,
            });
        } else {
             // Fallback if no matching mock is found
             selectedCrew.push({
                id: `mock-fallback-${role.replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 9)}`,
                role: role,
                name: `Mock ${role}`,
            });
        }
    });

    return [pilot, ...selectedCrew];
};

export interface AutoPatientData {
    patientAge: string;
    patientGender: PatientGender;
    patientWeightLbs: string;
    patientDetails: string;
    medicalResponse: string;
}

export const autoGeneratePatient = (): AutoPatientData => {
    const genders: PatientGender[] = ['Male', 'Female', 'Other'];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    
    const randomAge = Math.floor(Math.random() * 80) + 1;
    const randomWeight = Math.floor(Math.random() * 150) + 100; // 100 to 250 lbs

    const mockDetails = [
        "Motor Vehicle Accident (MVA) - High speed impact. Patient entrapped, extrication complete. GCS 13.",
        "Cardiac Arrest - ROSC achieved. Requires immediate transport to PCI center.",
        "Fall from height (30ft). Multiple fractures suspected. Patient conscious but disoriented.",
        "Severe burn injury (2nd/3rd degree) covering 40% TBSA. Stabilized for transport.",
    ];
    const mockResponse = [
        "Intubation performed, mechanical ventilation initiated. IV access secured. Fluids running.",
        "Defibrillation successful. Continuous cardiac monitoring. Administered Amiodarone.",
        "C-spine immobilized. Pelvic binder applied. Pain management initiated with Fentanyl.",
        "Burn dressings applied. Fluid resuscitation protocol started.",
    ];

    return {
        patientAge: randomAge.toString(),
        patientGender: randomGender,
        patientWeightLbs: randomWeight.toString(),
        patientDetails: mockDetails[Math.floor(Math.random() * mockDetails.length)],
        medicalResponse: mockResponse[Math.floor(Math.random() * mockResponse.length)],
    };
};