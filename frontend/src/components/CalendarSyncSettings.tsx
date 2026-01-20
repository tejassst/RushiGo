import { useState, useEffect } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Calendar, Loader2, Link2, Unlink, CheckCircle2 } from "lucide-react";
import { useToast } from "../hooks/useToast";
import {
  apiClient,
  type CalendarPreferences,
  type UpdateCalendarPreferencesRequest,
  type CalendarConnectionStatus,
} from "../services/api";

export function CalendarSyncSettings() {
  const [preferences, setPreferences] = useState<CalendarPreferences>({
    calendar_sync_enabled: false,
  });
  const [connectionStatus, setConnectionStatus] =
    useState<CalendarConnectionStatus>({
      connected: false,
    });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
    fetchConnectionStatus();
  }, []);

  const fetchPreferences = async () => {
    try {
      const prefs = await apiClient.getCalendarPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to fetch calendar preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load calendar settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async () => {
    try {
      const status = await apiClient.getCalendarStatus();
      setConnectionStatus(status);
    } catch (error) {
      console.error("Failed to fetch calendar connection status:", error);
    }
  };

  const handleConnectCalendar = () => {
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(
      apiClient.getCalendarConnectUrl(),
      "Google Calendar OAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Poll for popup close or listen for message
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        // Refresh connection status after popup closes
        setTimeout(() => {
          fetchConnectionStatus();
          toast({
            title: "Calendar Connected",
            description: "Your Google Calendar has been connected successfully",
          });
        }, 1000);
      }
    }, 500);
  };

  const handleDisconnectCalendar = async () => {
    setDisconnecting(true);
    try {
      await apiClient.disconnectCalendar();
      setConnectionStatus({ connected: false });
      setPreferences({ ...preferences, calendar_sync_enabled: false });

      toast({
        title: "Calendar Disconnected",
        description: "Your Google Calendar has been disconnected",
      });
    } catch (error) {
      console.error("Failed to disconnect calendar:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect calendar",
        variant: "destructive",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    // Require calendar connection before enabling sync
    if (enabled && !connectionStatus.connected) {
      toast({
        title: "Calendar Not Connected",
        description: "Please connect your Google Calendar first",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const updated = await apiClient.updateCalendarPreferences({
        calendar_sync_enabled: enabled,
      });
      setPreferences(updated);

      toast({
        title: enabled ? "Calendar Sync Enabled" : "Calendar Sync Disabled",
        description: enabled
          ? "Your deadlines will now sync to Google Calendar"
          : "Your deadlines will no longer sync to Google Calendar",
      });
    } catch (error) {
      console.error("Failed to update calendar preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update calendar sync settings",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Google Calendar Sync</CardTitle>
        </div>
        <CardDescription>
          Automatically sync your RushiGo deadlines to your personal Google
          Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar Connection Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Calendar Connection</Label>
              <p className="text-sm text-muted-foreground">
                Connect your Google Calendar to sync deadlines
              </p>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus.connected ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not Connected
                </span>
              )}
            </div>
          </div>

          {connectionStatus.connected ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectCalendar}
                disabled={disconnecting}
                className="w-full"
              >
                {disconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect Calendar
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnectCalendar}
              className="w-full"
              variant="default"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Connect Google Calendar
            </Button>
          )}
        </div>

        {/* Divider */}
        {connectionStatus.connected && (
          <div className="border-t pt-6">
            {/* Calendar Sync Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="calendar-sync" className="text-base">
                  Enable Calendar Sync
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, all your deadlines will appear as events in your
                  Google Calendar
                </p>
              </div>
              <Switch
                id="calendar-sync"
                checked={preferences.calendar_sync_enabled}
                onCheckedChange={handleToggle}
                disabled={updating}
              />
            </div>

            {preferences.calendar_sync_enabled && (
              <div className="mt-4 rounded-lg bg-muted p-4">
                <h4 className="text-sm font-medium mb-2">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ New deadlines automatically create calendar events</li>
                  <li>✅ Updated deadlines sync changes to calendar</li>
                  <li>✅ Deleted deadlines remove calendar events</li>
                  <li>✅ Events are color-coded by priority</li>
                  <li>✅ Automatic reminders before due dates</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
