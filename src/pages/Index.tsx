
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dog, Clock, MapPin, Settings, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ActionButtons from '@/components/ActionButtons';
import ActivityLog from '@/components/ActivityLog';
import SetupScreen from '@/components/SetupScreen';

export interface Activity {
  id: string;
  type: 'feed' | 'walk' | 'letout';
  timestamp: Date;
  caretaker: string;
  notes?: string;
}

export interface Schedule {
  feedTimes: string[];
  walkTimes: string[];
  instructions: {
    feeding: string;
    walking: string;
    letout: string;
  };
}

const Index = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({
    feedTimes: ['08:00', '18:00'],
    walkTimes: ['07:00', '12:00', '19:00'],
    instructions: {
      feeding: 'Give 1 cup of kibble with treats',
      walking: 'Walk around the block for 15-20 minutes',
      letout: 'Let out for 5-10 minutes in the backyard'
    }
  });
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();

  const addActivity = (type: 'feed' | 'walk' | 'letout', caretaker: string, notes?: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      caretaker,
      notes
    };
    
    setActivities(prev => [newActivity, ...prev]);
    
    const actionNames = {
      feed: 'Fed',
      walk: 'Walked',
      letout: 'Let out'
    };
    
    toast({
      title: `${actionNames[type]} ✓`,
      description: `Logged by ${caretaker}`,
    });
  };

  const getNextScheduledTime = (times: string[]) => {
    const now = new Date();
    const today = now.toDateString();
    
    for (const time of times) {
      const [hours, minutes] = time.split(':');
      const scheduledTime = new Date();
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (scheduledTime > now) {
        return scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
    
    // If no more times today, show first time tomorrow
    const [hours, minutes] = times[0].split(':');
    return `${hours}:${minutes} (tomorrow)`;
  };

  if (showSetup) {
    return (
      <SetupScreen 
        schedule={schedule} 
        onSave={setSchedule} 
        onClose={() => setShowSetup(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-8">
          <div className="flex items-center gap-2">
            <Dog className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">PupCare</h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSetup(true)}
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="space-y-4">
            {/* Schedule Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Next Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Feed:</span>
                  <Badge variant="outline">{getNextScheduledTime(schedule.feedTimes)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Walk:</span>
                  <Badge variant="outline">{getNextScheduledTime(schedule.walkTimes)}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <ActionButtons onAction={addActivity} schedule={schedule} />

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activities logged yet</p>
                ) : (
                  <div className="space-y-2">
                    {activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{activity.type}</span>
                        <span className="text-gray-500">
                          {activity.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log">
            <ActivityLog activities={activities} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
