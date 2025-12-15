import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Calendar,
  Link2,
  Unlink,
  Loader2,
  RefreshCw,
  Clock,
  Inbox
} from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationSource {
  id: string;
  name: string;
  type: 'email' | 'calendar';
  icon: React.ReactNode;
  connected: boolean;
  lastSync?: string;
  itemCount?: number;
}

interface EmailCalendarIntegrationProps {
  onImportTasks: (source: string, items: string[]) => void;
}

const EmailCalendarIntegration: React.FC<EmailCalendarIntegrationProps> = ({ onImportTasks }) => {
  const [integrations, setIntegrations] = useState<IntegrationSource[]>([
    { id: 'gmail', name: 'Gmail', type: 'email', icon: <Mail className="h-4 w-4" />, connected: false },
    { id: 'outlook', name: 'Outlook', type: 'email', icon: <Mail className="h-4 w-4" />, connected: false },
    { id: 'gcal', name: 'Google Calendar', type: 'calendar', icon: <Calendar className="h-4 w-4" />, connected: false },
    { id: 'outlook-cal', name: 'Outlook Calendar', type: 'calendar', icon: <Calendar className="h-4 w-4" />, connected: false },
  ]);
  
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState('15');

  // Simulated demo data for connected integrations
  const demoEmails = [
    "Urgent: Q4 Budget Review Meeting - Need your approval by EOD",
    "Client follow-up: Proposal revisions requested for Project Alpha",
    "Team standup notes from yesterday - action items assigned to you",
    "HR: Benefits enrollment deadline approaching - Dec 20th",
    "Invoice #4521 from vendor requires payment authorization",
  ];

  const demoCalendarEvents = [
    "Tomorrow 10AM: Quarterly planning meeting with stakeholders",
    "Today 3PM: 1-on-1 with team lead - performance review",
    "Friday: Project deadline - Final deliverables due",
    "Next Monday: Client presentation - prepare slides",
  ];

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId);
    
    // Simulate OAuth flow delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { 
            ...int, 
            connected: true, 
            lastSync: new Date().toLocaleTimeString(),
            itemCount: int.type === 'email' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10) + 2
          }
        : int
    ));
    
    setIsConnecting(null);
    toast.success(`Connected to ${integrations.find(i => i.id === integrationId)?.name}!`);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === integrationId 
        ? { ...int, connected: false, lastSync: undefined, itemCount: undefined }
        : int
    ));
    toast.info(`Disconnected from ${integrations.find(i => i.id === integrationId)?.name}`);
  };

  const handleSync = async () => {
    const connectedIntegrations = integrations.filter(i => i.connected);
    if (connectedIntegrations.length === 0) {
      toast.error('No integrations connected');
      return;
    }

    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate importing tasks from connected sources
    const emailIntegrations = connectedIntegrations.filter(i => i.type === 'email');
    const calendarIntegrations = connectedIntegrations.filter(i => i.type === 'calendar');

    if (emailIntegrations.length > 0) {
      onImportTasks('Email', demoEmails);
    }
    if (calendarIntegrations.length > 0) {
      onImportTasks('Calendar', demoCalendarEvents);
    }

    // Update last sync times
    setIntegrations(prev => prev.map(int => 
      int.connected 
        ? { 
            ...int, 
            lastSync: new Date().toLocaleTimeString(),
            itemCount: int.type === 'email' ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10) + 2
          }
        : int
    ));

    setIsSyncing(false);
    toast.success(`Synced ${connectedIntegrations.length} integrations`);
  };

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            Import Tasks
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {connectedCount} connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Integration List */}
        <div className="space-y-2">
          {integrations.map(integration => (
            <div 
              key={integration.id}
              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                integration.connected 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={integration.connected ? 'text-primary' : 'text-muted-foreground'}>
                  {integration.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{integration.name}</p>
                  {integration.connected && integration.lastSync && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last sync: {integration.lastSync}
                      {integration.itemCount && (
                        <span className="ml-2">• {integration.itemCount} items</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant={integration.connected ? "ghost" : "outline"}
                size="sm"
                onClick={() => integration.connected 
                  ? handleDisconnect(integration.id) 
                  : handleConnect(integration.id)
                }
                disabled={isConnecting === integration.id}
                className={integration.connected ? 'text-destructive hover:text-destructive' : ''}
              >
                {isConnecting === integration.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : integration.connected ? (
                  <>
                    <Unlink className="h-3 w-3 mr-1" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Link2 className="h-3 w-3 mr-1" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Auto-sync Settings */}
        {connectedCount > 0 && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Auto-sync</span>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
            
            {autoSync && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Every</span>
                <Input 
                  type="number" 
                  min="5" 
                  max="60" 
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value)}
                  className="w-16 h-7 text-xs"
                />
                <span className="text-xs text-muted-foreground">minutes</span>
              </div>
            )}
          </div>
        )}

        {/* Sync Button */}
        <Button 
          className="w-full" 
          onClick={handleSync}
          disabled={connectedCount === 0 || isSyncing}
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All & Import Tasks
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Tasks from connected sources will be analyzed for cognitive load
        </p>
      </CardContent>
    </Card>
  );
};

export default EmailCalendarIntegration;
