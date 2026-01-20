import { useState, useEffect } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { useToast } from "../hooks/useToast";
import {
  apiClient,
  type CalendarPreferences,
  type UpdateCalendarPreferencesRequest,
} from "../services/api";

export function CalendarSyncSettings() {
  const [preferences, setPreferences] = useState<CalendarPreferences>({
    calendar_sync_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
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

  const handleToggle = async (enabled: boolean) => {
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
          Automatically sync your RushiGo deadlines to Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
