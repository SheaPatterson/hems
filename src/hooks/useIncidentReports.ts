import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { azureClient } from '@/integrations/azure/client';
import { toast } from 'sonner';

export interface IncidentReport {
  id: string;
  mission_id: string;
  user_id: string;
  report_type: 'Operational' | 'Maintenance' | 'Medical' | 'Weather' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  actions_taken: string | null;
  status: 'Open' | 'Resolved';
  resolution: string | null;
  created_at: string;
}

const fetchReports = async (): Promise<IncidentReport[]> => {
  const response = await azureClient.functions.invoke('incident-reports', { method: 'GET' });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch incident reports');
  }
  return await response.json() as IncidentReport[];
};

const createReport = async (report: Partial<IncidentReport>): Promise<IncidentReport> => {
  const response = await azureClient.functions.invoke('incident-reports', {
    method: 'POST',
    body: report,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create incident report');
  }
  return await response.json() as IncidentReport;
};

const resolveReport = async ({ id, resolution }: { id: string, resolution: string }): Promise<void> => {
  const response = await azureClient.functions.invoke(`incident-reports/${id}`, {
    method: 'PATCH',
    body: { status: 'Resolved', resolution },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to resolve incident');
  }
};

export const useIncidentReports = () => {
  const queryClient = useQueryClient();
  const queryKey = ['incidentReports'];

  const reportsQuery = useQuery({
    queryKey,
    queryFn: fetchReports,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Safety report filed successfully.");
    }
  });

  const resolveMutation = useMutation({
      mutationFn: resolveReport,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey });
          toast.success("Incident officially closed and resolved.");
      },
      onError: (e: any) => toast.error(`Failed to resolve: ${e.message}`)
  });

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    isError: reportsQuery.isError,
    fileReport: createMutation.mutateAsync,
    resolveReport: resolveMutation.mutateAsync,
    isSubmitting: createMutation.isPending,
    isResolving: resolveMutation.isPending,
  };
};
