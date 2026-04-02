import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// NOTE: The raw invite link (https://discord.gg/2cVkuXpU) is often blocked from embedding.
// We should use the official Discord Widget URL format.
// Since the server ID is unknown, we use a placeholder widget URL.
// If the user provides the Server ID, this URL should be updated to:
// `https://discord.com/widget?id=YOUR_SERVER_ID&theme=dark`
const DISCORD_WIDGET_URL = "https://discord.com/widget?id=123456789012345678&theme=dark"; 
const DISCORD_INVITE_URL = "https://discord.gg/2cVkuXpU"; // Kept for the external link button

const DiscordCommunity = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-primary text-shadow-primary" /> Discord Community
          </CardTitle>
          <CardDescription>
            Join the official HEMS Simulation Discord server for real-time chat, support, and community discussions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <div className="w-full h-[80vh] min-h-[500px] flex flex-col items-center justify-center bg-muted/50">
            <iframe 
              src={DISCORD_WIDGET_URL} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Discord Community"
              className="flex-grow"
            ></iframe>
            <div className="p-4 w-full border-t bg-background">
                <Button asChild className="w-full">
                    <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open Discord in New Tab
                    </a>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscordCommunity;