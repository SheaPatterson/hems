export interface AirportData {
    ICAO: string;
    IATA: string | null;
    name: string;
    regionName: string | null;
    elevation: number;
    lat: number;
    lon: number;
    magneticVariation: number;
    timezone: {
        name: string | null;
        offset: number | null;
    };
    times: {
        sunrise: string;
        sunset: string;
        dawn: string;
        dusk: string;
    };
    runwayCount: number;
    runways: Runway[];
    frequencies: Frequency[];
    weather: {
        METAR: string | null;
        TAF: string | null;
    };
}

export interface Runway {
    ident: string;
    width: number;
    length: number;
    bearing: number;
    surface: string;
    markings: string[];
    lighting: string[];
    thresholdOffset: number;
    overrunLength: number;
    ends: RunwayEnd[];
    navaids: Navaid[];
}

export interface RunwayEnd {
    ident: string;
    lat: number;
    lon: number;
}

export interface Navaid {
    ident: string;
    type: 'LOC-ILS' | 'LOC-LOC' | 'GS' | 'DME';
    lat: number;
    lon: number;
    airport: string;
    runway: string;
    frequency: number | null;
    slope: number | null;
    bearing: number | null;
    name: string | null;
    elevation: number;
    range: number;
}

export interface Frequency {
    type: string;
    frequency: number;
    name: string | null;
}