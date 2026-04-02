import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Info, Edit3 } from 'lucide-react';
import { ConfigItem, useConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/utils';

interface ConfigFormProps {
  item: ConfigItem;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ item }) => {
  const [value, setValue] = useState(item.value);
  const { upsertConfig, isSaving } = useConfig();

  useEffect(() => {
    setValue(item.value);
  }, [item.value]);

  const hasChanged = value.trim() !== item.value.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanged) return;

    try {
      await upsertConfig({
        key: item.key,
        value: value.trim(),
        description: item.description,
      });
    } catch (error) {
      // Handled by hook
    }
  };

  const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <Card className={cn(
        "transition-all duration-300 border-2",
        hasChanged ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border hover:border-muted-foreground/30"
    )}>
      <CardHeader className="p-4 pb-2 bg-muted/20">
        <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/80">
                {formatKey(item.key)}
            </CardTitle>
            {hasChanged && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-primary text-primary-foreground tracking-tighter animate-pulse">
                    UNSAVED
                </span>
            )}
        </div>
        <CardDescription className="text-xs leading-tight mt-1 line-clamp-2">
            {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor={`value-${item.key}`} className="text-[10px] font-bold uppercase text-muted-foreground flex items-center">
                    <Edit3 className="w-3 h-3 mr-1" /> Active Value
                </Label>
                <span className="text-[9px] font-mono text-muted-foreground italic">
                    Updated: {new Date(item.updated_at).toLocaleDateString()}
                </span>
            </div>
            <Input
                id={`value-${item.key}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isSaving}
                className="font-mono text-lg font-bold bg-background/50 focus-visible:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
              <div className="flex items-center text-[10px] text-muted-foreground">
                  <Info className="w-3 h-3 mr-1" />
                  <span>Global Sync</span>
              </div>
              <Button 
                type="submit" 
                size="sm" 
                disabled={isSaving || !hasChanged}
                className={cn(
                    "min-w-[80px] h-8 text-[10px] font-bold tracking-widest uppercase",
                    hasChanged ? "bg-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>COMMIT</>
                )}
              </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConfigForm;