import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AirportData } from '@/types/flightplandb';
import { toast } from 'sonner';

const fetchAirportData = async (icao: string): Promise<AirportData> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Authentication required');

    const { data, error } = await supabase.functions.invoke('fetch-airport-info', {
        body: { icao },
    });

    if (error) throw new Error(error.message);
    if (data.error) throw new Error(data.error);

    return data;
};

export const useAirportInfo = () => {
    return useMutation({
        mutationFn: fetchAirportData,
        onSuccess: (data) => {
            toast.success(`Successfully fetched data for ${data.ICAO}.`);
        },
        onError: (error: any) => {
            toast.error(`Failed to fetch airport data: ${error.message}`);
        },
    });
};