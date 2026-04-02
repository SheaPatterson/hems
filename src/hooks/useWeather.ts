import { useQuery } from '@tanstack/react-query';

export interface MetarData {
    station: string;
    raw: string;
    temp: number;
    wind: string;
    visibility: string;
    condition: 'VFR' | 'IFR' | 'MVFR' | 'LIFR';
    timestamp: string;
}

// Mock implementation of CheckWX API response
const fetchMetar = async (icao: string): Promise<MetarData | null> => {
    if (!icao || icao.length < 3) return null;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For now, returning mock data based on the station
    // In production, this would be a fetch to an Edge Function proxying CheckWX
    return {
        station: icao.toUpperCase(),
        raw: `${icao.toUpperCase()} 241853Z 24012KT 10SM CLR 18/04 A2998`,
        temp: 18,
        wind: "240 @ 12KT",
        visibility: "10SM",
        condition: 'VFR',
        timestamp: new Date().toISOString()
    };
};

export const useWeather = (icao?: string) => {
    return useQuery({
        queryKey: ['metar', icao],
        queryFn: () => fetchMetar(icao!),
        enabled: !!icao && icao.length >= 3,
        staleTime: 1000 * 60 * 15, // 15 mins
    });
};