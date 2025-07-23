
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
              <Dog className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                PupCare
              </h1>
              <p className="text-sm text-gray-500">Keep your pup happy</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSetup(true)}
            className="rounded-2xl border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
            <TabsTrigger value="actions" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Plus className="h-4 w-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4" />
              Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="space-y-6">
            {/* Schedule Overview */}
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Next Scheduled
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                  <span className="text-sm font-medium text-gray-700">🍽️ Feed:</span>
                  <Badge variant="outline" className="rounded-full bg-white/80 border-green-200 text-green-700">
                    {getNextScheduledTime(schedule.feedTimes)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl">
                  <span className="text-sm font-medium text-gray-700">🚶 Walk:</span>
                  <Badge variant="outline" className="rounded-full bg-white/80 border-blue-200 text-blue-700">
                    {getNextScheduledTime(schedule.walkTimes)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <ActionButtons onAction={addActivity} schedule={schedule} />

            {/* Recent Activity Summary */}
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🐕</div>
                    <p className="text-gray-500">No activities logged yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start by marking some activities!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {activity.type === 'feed' ? '🍽️' : activity.type === 'walk' ? '🚶' : '🏠'}
                          </div>
                          <span className="font-medium capitalize text-gray-700">{activity.type}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">
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
