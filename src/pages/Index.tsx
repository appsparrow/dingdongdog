
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCheck, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TimeOfDayActions from '@/components/TimeOfDayActions';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
  phone_number?: string;
}

interface Activity {
  id: string;
  type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  date: string;
  caretaker_id: string;
  notes?: string;
  created_at: string;
}

const Index = ({ profile, onShowSetup }: { profile: Profile; onShowSetup: () => void }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    // Set document title for PWA
    document.title = 'DingDongDog - Pet Care Tracker';
    
    // Add viewport meta tag for mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_code', profile.session_code);
      
      setProfiles(profilesData || []);

      // Fetch today's activities
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });
      
      // Type the activities data properly
      const typedActivities: Activity[] = (activitiesData || []).map(activity => ({
        id: activity.id,
        type: activity.type as 'feed' | 'walk' | 'letout',
        time_period: activity.time_period as 'morning' | 'afternoon' | 'evening',
        date: activity.date,
        caretaker_id: activity.caretaker_id,
        notes: activity.notes,
        created_at: activity.created_at
      }));
      
      setActivities(typedActivities);

      // Update completed activities state
      const completed: { [key: string]: boolean } = {};
      typedActivities.forEach(activity => {
        completed[`${activity.type}-${activity.time_period}-${activity.caretaker_id}`] = true;
      });
      setCompletedActivities(completed);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (type: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening', caretakerId: string) => {
    try {
      // Insert activity
      const { error } = await supabase
        .from('activities')
        .insert({
          type,
          time_period: timePeriod,
          date: today,
          caretaker_id: caretakerId
        });

      if (error) throw error;

      // Optimistically update UI
      setActivities(prevActivities => [
        {
          id: 'temp-' + Math.random(), // Temporary ID
          type,
          time_period: timePeriod,
          date: today,
          caretaker_id: caretakerId,
          created_at: new Date().toISOString()
        },
        ...prevActivities
      ]);

      setCompletedActivities(prev => ({
        ...prev,
        [`${type}-${timePeriod}-${caretakerId}`]: true
      }));
    } catch (error) {
      console.error('Error inserting activity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>{profile.short_name}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {profile.name}
                </CardTitle>
                <p className="text-gray-500">Caretaker</p>
              </div>
            </div>
            <Button onClick={onShowSetup} variant="outline" size="sm" className="rounded-2xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
              Settings
            </Button>
          </CardHeader>
        </Card>

        {/* Today's Activities */}
        <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Clock className="h-6 w-6 text-blue-500" />
              Today's Activities
            </CardTitle>
            <p className="text-gray-500">What's been done today</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-gray-500">No activities yet today.</p>
            ) : (
              activities.map((activity) => {
                const caretaker = profiles.find(p => p.id === activity.caretaker_id);
                return (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                    <div>
                      <p className="font-medium text-gray-700">{activity.type}</p>
                      <p className="text-sm text-gray-500">{activity.time_period}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {caretaker?.short_name || '?'}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-600 border-0">
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Time of Day Actions */}
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <TimeOfDayActions
            profiles={profiles}
            onAction={handleAction}
            completedActivities={completedActivities}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
