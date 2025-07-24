import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  profile: any;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ profile }) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    if (!notificationService.isSupported()) {
      return;
    }

    const status = notificationService.getPermissionStatus();
    setPermissionStatus(status);
    setNotificationsEnabled(status === 'granted');

    try {
      const subscription = await notificationService.getPushSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestNotificationPermission = async () => {
    setIsLoading(true);
    try {
      const permission = await notificationService.requestPermission();
      setPermissionStatus(permission);
      setNotificationsEnabled(permission === 'granted');

      if (permission === 'granted') {
        await notificationService.registerServiceWorker();
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications for new activities!",
          variant: "default"
        });
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You can enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      await requestNotificationPermission();
    } else {
      // For now, we can't programmatically disable notifications
      // Users need to do this in browser settings
      toast({
        title: "Notifications",
        description: "To disable notifications, please update your browser settings.",
        variant: "default"
      });
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendLocalNotification(
        'DingDongDog Test',
        'This is a test notification! 🐕',
        { type: 'test' }
      );
      toast({
        title: "Test Notification Sent",
        description: "Check your notifications!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    }
  };

  if (!notificationService.isSupported()) {
    return (
      <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            <BellOff className="h-5 w-5 text-orange-500" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Bell className="h-5 w-5 text-blue-500" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Notification Permission</p>
              <p className="text-sm text-gray-500">
                {permissionStatus === 'granted' ? 'Notifications enabled' : 
                 permissionStatus === 'denied' ? 'Notifications blocked' : 
                 'Permission not requested'}
              </p>
            </div>
          </div>
          <Badge 
            variant={permissionStatus === 'granted' ? 'default' : 
                    permissionStatus === 'denied' ? 'destructive' : 'secondary'}
          >
            {permissionStatus}
          </Badge>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Enable Notifications</Label>
            <p className="text-xs text-gray-500">
              Receive notifications when activities are added
            </p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={toggleNotifications}
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {permissionStatus === 'granted' && (
            <Button
              onClick={testNotification}
              variant="outline"
              className="flex-1 rounded-2xl"
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Notification
            </Button>
          )}
          
          {permissionStatus !== 'granted' && (
            <Button
              onClick={requestNotificationPermission}
              disabled={isLoading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          )}
        </div>

        {/* Help Text */}
        {permissionStatus === 'denied' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <p className="text-sm text-yellow-800">
              <strong>Notifications are blocked.</strong> To enable them, click the lock icon in your browser's address bar and allow notifications for this site.
            </p>
          </div>
        )}

        {permissionStatus === 'granted' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-sm text-green-800">
              <strong>Notifications are enabled!</strong> You'll receive notifications when new activities are added to the pet care schedule.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings; 