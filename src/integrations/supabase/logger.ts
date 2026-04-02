import { azureClient } from '@/integrations/azure/client';

export const log = async (message: string, level: 'INFO' | 'WARNING' | 'ERROR') => {
  const timestamp = new Date().toISOString();

  try {
    const response = await azureClient.functions.invoke('logs', {
      method: 'POST',
      body: { level, message },
    });

    if (!response.ok) {
      console.error(`Error logging message to DB: ${response.statusText}`);
    } else {
      console.log(`[${timestamp}] ${level}: ${message}`);
    }
  } catch (error) {
    console.error(`Network error during logging: ${error}`);
  }
};
