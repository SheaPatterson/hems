import { Settings, Loader2, Info, ShieldAlert, Zap, Server } from 'lucide-react';
import { useConfig, ConfigItem } from '@/hooks/useConfig';
import ConfigForm from '@/components/admin/ConfigForm';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DEFAULT_SETTINGS: ConfigItem[] = [
    { key: 'systemName', value: 'HEMS SIMULATION', description: 'The official name of the application.', updated_at: new Date().toISOString() },
    { key: 'fuelReserveMinutes', value: '20', description: 'Required fuel reserve time for Go/No-Go calculation (minutes).', updated_at: new Date().toISOString() },
    { key: 'maxPatientWeightLbs', value: '350', description: 'Maximum patient weight allowed for transport (Lbs).', updated_at: new Date().toISOString() },
    { key: 'supportEmail', value: 'ops@hemssim.com', description: 'Primary contact email for system support.', updated_at: new Date().toISOString() },
];

const AdminConfiguration = () => {
  const { config, isLoading } = useConfig();

  const configMap = new Map(config.map(c => [c.key, c]));
  const displayConfig = DEFAULT_SETTINGS.map(defaultItem => configMap.get(defaultItem.key) || defaultItem);

  const sections = [
    {
        id: 'infra',
        title: "Tactical Infrastructure",
        desc: "System connectivity parameters.",
        icon: Server,
        items: displayConfig.filter(c => ['systemName', 'supportEmail'].includes(c.key))
    },
    {
        id: 'ops',
        title: "Flight Safety Thresholds",
        desc: "Core parameters dictating Go/No-Go logic.",
        icon: Zap,
        items: displayConfig.filter(c => ['fuelReserveMinutes', 'maxPatientWeightLbs'].includes(c.key))
    }
  ];

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-8">
      <header className="flex justify-between items-end">
          <div>
              <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
                <Settings className="w-10 h-10 mr-3 text-primary" /> System Configuration
              </h1>
              <p className="text-lg text-muted-foreground mt-1">Adjust global operational parameters and regional thresholds.</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Global Master Control</span>
          </div>
      </header>

      <Alert variant="destructive" className="bg-orange-500/5 border-orange-500/30">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-bold uppercase tracking-tighter">Impact Warning</AlertTitle>
        <AlertDescription className="text-sm font-medium">
          Changes to safety thresholds are applied instantly to all active units.
        </AlertDescription>
      </Alert>

      <div className="space-y-12">
          {sections.map((section) => (
              <section key={section.id} className="space-y-6">
                  <div className="flex items-center space-x-3 border-l-4 border-primary pl-4">
                      <section.icon className="w-6 h-6 text-primary" />
                      <div>
                          <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
                          <p className="text-muted-foreground text-sm">{section.desc}</p>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.items.map((item) => (
                          <ConfigForm key={item.key} item={item} />
                      ))}
                  </div>
                  <Separator className="mt-8" />
              </section>
          ))}
      </div>
    </div>
  );
};

export default AdminConfiguration;