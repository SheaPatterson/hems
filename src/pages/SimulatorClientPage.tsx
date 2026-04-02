import SimulatorPluginUI from '@/components/SimulatorPluginUI';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TestTube } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const SimulatorClientPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl h-full flex flex-col space-y-8">
      <PageHeader 
        title="Simulator Client"
        description="Interact with the HEMS Dispatch Simulator Interface directly for testing and demonstration purposes."
        icon={TestTube}
      />
      
      <div className="flex-grow min-h-[750px]">
        <SimulatorPluginUI />
      </div>
      
      <Card className="mt-8 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="text-xl text-yellow-700 dark:text-yellow-300">Note on Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            This page simulates the functionality of the external flight simulator plugin. It uses the same API endpoints to fetch missions and send telemetry updates, allowing you to test the full integration loop without running an external simulator.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulatorClientPage;