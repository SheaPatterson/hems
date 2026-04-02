"use client";

export type PilotRank = {
    title: string;
    level: number;
    color: string;
    minMissions: number;
};

export const PILOT_RANKS: PilotRank[] = [
    { title: "Flight Trainee", level: 1, color: "bg-slate-500", minMissions: 0 },
    { title: "Junior First Officer", level: 2, color: "bg-blue-500", minMissions: 5 },
    { title: "First Officer", level: 3, color: "bg-emerald-500", minMissions: 15 },
    { title: "Captain", level: 4, color: "bg-primary", minMissions: 30 },
    { title: "Senior Captain", level: 5, color: "bg-indigo-600", minMissions: 75 },
    { title: "Chief Pilot", level: 6, color: "bg-red-600", minMissions: 150 },
];

export const calculatePilotRank = (missionCount: number): PilotRank => {
    return [...PILOT_RANKS].reverse().find(r => missionCount >= r.minMissions) || PILOT_RANKS[0];
};

export const getNextRankProgress = (missionCount: number) => {
    const currentRank = calculatePilotRank(missionCount);
    const nextRank = PILOT_RANKS.find(r => r.level === currentRank.level + 1);
    
    if (!nextRank) return { percent: 100, remaining: 0, nextTitle: 'Max Level' };
    
    const range = nextRank.minMissions - currentRank.minMissions;
    const progress = missionCount - currentRank.minMissions;
    const percent = Math.min(100, Math.round((progress / range) * 100));
    
    return {
        percent,
        remaining: nextRank.minMissions - missionCount,
        nextTitle: nextRank.title
    };
};