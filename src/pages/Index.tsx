
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/AuthScreen';
import SetupScreen from '@/components/SetupScreen';
import TimeOfDayActions from '@/components/TimeOfDayActions';
import TodayActivity from '@/components/TodayActivity';

interface Activity {
  id: string;
  type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker_id: string;
  date: string;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
  phone_number?: string;
}

const Index = () => {
  const { user, profile, isLoading, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    try {
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_code', profile.session_code);
      
      setProfiles(profilesData || []);

      // Fetch today's activities
      const today = new Date().toISOString().split('T')[0];
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });
      
      setActivities(activitiesData || []);

      // Build completed activities map
      const completed: { [key: string]: boolean } = {};
      activitiesData?.forEach(activity => {
        const key = `${activity.type}-${activity.time_period}-${activity.caretaker_id}`;
        completed[key] = true;
      });
      setCompletedActivities(completed);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = (userProfile: Profile) => {
    // Auth state will be handled by useAuth hook
    toast({
      title: "Welcome!",
      description: `Hello ${userProfile.name}`,
    });
  };

  const addActivity = async (type: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening', caretakerId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          type,
          time_period: timePeriod,
          caretaker_id: caretakerId,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      await fetchData();
      
      const caretaker = profiles.find(p => p.id === caretakerId);
      const actionNames = {
        feed: 'Fed',
        walk: 'Walked',
        letout: 'Let out'
      };
      
      toast({
        title: `${actionNames[type]} ✓`,
        description: `Logged by ${caretaker?.name} for ${timePeriod}`,
      });
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to log activity. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐕</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (showSetup) {
    return <SetupScreen profile={profile} onClose={() => setShowSetup(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DingDongDog
            </h1>
            <p className="text-sm text-gray-500">Welcome {profile.name}</p>
          </div>
          <div className="flex gap-2">
            {profile.is_admin && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSetup(true)}
                className="rounded-2xl border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="rounded-2xl border-2 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Time of Day Actions */}
          <TimeOfDayActions 
            profiles={profiles}
            onAction={addActivity}
            completedActivities={completedActivities}
          />

          {/* Today's Activity */}
          <TodayActivity 
            activities={activities}
            profiles={profiles}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
