"use client";

export interface ChecklistItem {
    id: string;
    label: string;
    description?: string;
}

export interface MissionChecklist {
    phase: string;
    items: ChecklistItem[];
}

export const HEMS_CHECKLISTS: MissionChecklist[] = [
    {
        phase: "Pre-Flight / Dispatch",
        items: [
            { id: 'pre-1', label: 'Weather Minimums Verified', description: 'Check regional METARs and TAFs for flight path.' },
            { id: 'pre-2', label: 'Fuel Requirements Confirmed', description: 'Ensure destination + reserve margin is met.' },
            { id: 'pre-3', label: 'Aircraft Performance Calculated', description: 'Verify weight and balance for patient mass.' },
            { id: 'pre-4', label: 'Crew Briefing Complete', description: 'Brief medical crew on LZ hazards and route.' },
        ]
    },
    {
        phase: "On-Scene / Transition",
        items: [
            { id: 'scn-1', label: 'LZ Visual Contact Established', description: 'Verify landing area clear of obstacles/wires.' },
            { id: 'scn-2', label: 'Ground Comms Established', description: 'Contact local Fire/EMS for final LZ clearance.' },
            { id: 'scn-3', label: 'Patient Secured / Hot Load', description: 'Medical crew confirms patient loaded and secured.' },
            { id: 'scn-4', label: 'Departing / Transition to EMS-3', description: 'Notify dispatch of departure from scene.' },
        ]
    },
    {
        phase: "Hospital / Handoff",
        items: [
            { id: 'hosp-1', label: 'Final Approach Briefed', description: 'Review rooftop or pad-specific arrival procedures.' },
            { id: 'hosp-2', label: 'Engine Shutdown / Idle', description: 'Secure aircraft per site policy for patient offload.' },
            { id: 'hosp-3', label: 'Clinical Handoff Complete', description: 'Bedside report provided to trauma team.' },
        ]
    }
];