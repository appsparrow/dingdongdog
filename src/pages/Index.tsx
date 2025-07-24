
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NextScheduled from '@/components/NextScheduled';
import QuickActions from '@/components/QuickActions';
import ActionConfirmDialog from '@/components/ActionConfirmDialog';
import SetupScreen from '@/components/SetupScreen';
import ActivityLogScreen from '@/components/ActivityLogScreen';
import { notificationService } from '@/services/notificationService';

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

interface Schedule {
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
  letout_count: number;
  pet_name?: string; // Added pet_name to Schedule interface
  pet_image_url?: string; // Added pet_image_url to Schedule interface
}

interface ScheduleTimes {
  feed: { [key: string]: boolean };
  walk: { [key: string]: boolean };
  letout: { [key: string]: boolean };
}

const Index = ({ profile, onShowSetup, onLogout }: { profile: Profile; onShowSetup: () => void; onLogout: () => void }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleTimes, setScheduleTimes] = useState<ScheduleTimes>({
    feed: { morning: false, afternoon: false, evening: false },
    walk: { morning: false, afternoon: false, evening: false },
    letout: { morning: false, afternoon: false, evening: false }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    actionType: 'feed' | 'walk' | 'letout' | null;
    timePeriod?: string;
  }>({ open: false, actionType: null });
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Default pet image for Zach
  const defaultPetImageUrl = '/profile-zach.png';

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
    if (profile.session_code) {
      fetchData();
      initializeNotifications();
    }
  }, [profile.session_code]);

  const initializeNotifications = async () => {
    try {
      if (notificationService.isSupported()) {
        await notificationService.registerServiceWorker();
        console.log('Notification service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching data for session:', profile.session_code);
      
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_code', profile.session_code);
      
      console.log('Profiles found:', profilesData);
      setProfiles(profilesData || []);

      // Fetch schedule
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*')
        .eq('session_code', profile.session_code)
        .single();
      
      console.log('Schedule found:', scheduleData);
      setSchedule(scheduleData);

      // Fetch schedule times
      let scheduleTimesData = null;

      // If no schedule exists, create a default one
      if (!scheduleData) {
        console.log('Creating default schedule for session:', profile.session_code);
        const { data: newSchedule, error: scheduleError } = await supabase
          .from('schedules')
          .insert({
            session_code: profile.session_code,
            feeding_instruction: 'Feed 1 cup of kibble',
            walking_instruction: 'Walk for 15 minutes',
            letout_instruction: 'Let out for potty break',
            letout_count: 3,
            pet_name: 'Zach',
            pet_image_url: '/profile-zach.png'
          })
          .select()
          .single();
        
        if (scheduleError) {
          console.error('Error creating default schedule:', scheduleError);
        } else {
          console.log('Default schedule created:', newSchedule);
          setSchedule(newSchedule);
          
          // Create default schedule times
          const defaultTimes = [
            { schedule_id: newSchedule.id, activity_type: 'feed', time_period: 'morning', time_of_day: 'morning' },
            { schedule_id: newSchedule.id, activity_type: 'feed', time_period: 'evening', time_of_day: 'evening' },
            { schedule_id: newSchedule.id, activity_type: 'walk', time_period: 'afternoon', time_of_day: 'afternoon' },
            { schedule_id: newSchedule.id, activity_type: 'letout', time_period: 'morning', time_of_day: 'morning' },
            { schedule_id: newSchedule.id, activity_type: 'letout', time_period: 'afternoon', time_of_day: 'afternoon' },
            { schedule_id: newSchedule.id, activity_type: 'letout', time_period: 'evening', time_of_day: 'evening' }
          ];
          
          const { data: newTimes, error: timesError } = await supabase
            .from('schedule_times')
            .insert(defaultTimes)
            .select();
          
          if (timesError) {
            console.error('Error creating default schedule times:', timesError);
          } else {
            console.log('Default schedule times created:', newTimes);
            scheduleTimesData = newTimes;
          }
        }
      } else {
        // Fetch schedule times for existing schedule
        const { data: timesData } = await supabase
          .from('schedule_times')
          .select('*')
          .eq('schedule_id', scheduleData.id);
        scheduleTimesData = timesData;
        console.log('Schedule times found:', timesData);
        
        // If no schedule times exist, create default ones
        if (!timesData || timesData.length === 0) {
          console.log('No schedule times found, creating default times for existing schedule');
          const defaultTimes = [
            { schedule_id: scheduleData.id, activity_type: 'feed', time_period: 'morning', time_of_day: 'morning' },
            { schedule_id: scheduleData.id, activity_type: 'feed', time_period: 'evening', time_of_day: 'evening' },
            { schedule_id: scheduleData.id, activity_type: 'walk', time_period: 'afternoon', time_of_day: 'afternoon' },
            { schedule_id: scheduleData.id, activity_type: 'letout', time_period: 'morning', time_of_day: 'morning' },
            { schedule_id: scheduleData.id, activity_type: 'letout', time_period: 'afternoon', time_of_day: 'afternoon' },
            { schedule_id: scheduleData.id, activity_type: 'letout', time_period: 'evening', time_of_day: 'evening' }
          ];
          
          const { data: newTimes, error: timesError } = await supabase
            .from('schedule_times')
            .insert(defaultTimes)
            .select();
          
          if (timesError) {
            console.error('Error creating default schedule times:', timesError);
          } else {
            console.log('Default schedule times created for existing schedule:', newTimes);
            scheduleTimesData = newTimes;
          }
        }
      }

      // Build schedule times object
      const times: ScheduleTimes = {
        feed: { morning: false, afternoon: false, evening: false },
        walk: { morning: false, afternoon: false, evening: false },
        letout: { morning: false, afternoon: false, evening: false }
      };

      if (scheduleTimesData) {
        scheduleTimesData.forEach((timeEntry) => {
          const { activity_type, time_period } = timeEntry;
          if (times[activity_type as keyof ScheduleTimes]) {
            times[activity_type as keyof ScheduleTimes][time_period as keyof typeof times.feed] = true;
          }
        });
      }
      
      console.log('Final schedule times object:', times);
      setScheduleTimes(times);

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


    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (type: 'feed' | 'walk' | 'letout') => {
    setConfirmDialog({ open: true, actionType: type });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.actionType) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          type: confirmDialog.actionType,
          caretaker_id: profile.id,
          time_period: confirmDialog.timePeriod || 'morning',
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Send notification to all users
      const activityNames = {
        feed: 'Feeding',
        walk: 'Walking',
        letout: 'Let Out'
      };

      const timeNames = {
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening'
      };

      const activityName = activityNames[confirmDialog.actionType as keyof typeof activityNames] || 'Activity';
      const timeName = timeNames[confirmDialog.timePeriod as keyof typeof timeNames] || '';
      const completedBy = profile.name;

      const notificationTitle = `${activityName} Completed`;
      const notificationBody = `${completedBy} completed ${activityName.toLowerCase()} for ${timeName.toLowerCase()}`;

      // Send notification if permission is granted
      if (notificationService.getPermissionStatus() === 'granted') {
        await notificationService.sendNotificationToAll(
          notificationTitle,
          notificationBody,
          {
            type: 'activity_completed',
            activityType: confirmDialog.actionType,
            timePeriod: confirmDialog.timePeriod,
            completedBy: profile.name,
            timestamp: new Date().toISOString()
          }
        );
      }

      toast({
        title: "Activity Logged",
        description: `${activityName} has been logged successfully!`,
        variant: "default"
      });

      setConfirmDialog({ open: false, actionType: null });
      fetchData();
    } catch (error) {
      console.error('Error logging activity:', error);
      toast({
        title: "Error",
        description: "Failed to log activity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleClick = (type: 'feed' | 'walk' | 'letout', timePeriod: string) => {
    setConfirmDialog({ open: true, actionType: type, timePeriod: timePeriod });
  };

  const handleActionClick = (type: 'feed' | 'walk' | 'letout') => {
    handleQuickAction(type);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="h-full overflow-y-auto">
        {/* DingDongDog Header */}
        <div className="max-w-md mx-auto px-6 py-4">
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center">
                  <img 
                    src="/logo.svg" 
                    alt="DingDongDog Logo" 
                    className="w-8 h-8"
                  />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                  DingDongDog
                </h1>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-md mx-auto pb-20">
          {/* Pet Name Card */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6 mx-6 mt-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center border-2 border-purple-200 overflow-hidden">
                    <img 
                      src={schedule?.pet_image_url || defaultPetImageUrl} 
                      alt="Pet" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-emoji');
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center text-2xl fallback-emoji" style={{ display: 'none' }}>
                      🐕
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Thanks for taking care of me!
                </h2>
                <p className="text-lg font-medium text-gray-700">
                  {schedule?.pet_name || 'Zach'} {/* Default pet name */}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {isLoading ? (
            <div className="text-center text-gray-500 mb-6 mx-6">Loading...</div>
          ) : (
            <div className="mb-6 mx-6">
              <NextScheduled 
                activities={activities} 
                profiles={profiles} 
                schedule={schedule} 
                scheduleTimes={scheduleTimes}
                onScheduleClick={handleScheduleClick}
              />
            </div>
          )}

          {/* Quick Actions */}
          {/* <div className="mx-6">
            <QuickActions profiles={profiles} onAction={handleQuickAction} />
          </div> */}

          {/* User Profile Footer */}
          <div className="mx-6 mt-8">
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
              <CardHeader className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>{profile.short_name}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {profile.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{profile.is_admin ? 'Owner' : 'Caretaker'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowActivityLog(true)} variant="outline" size="sm" className="rounded-2xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                    Log
                  </Button>
                  <Button onClick={() => setShowSettings(true)} variant="outline" size="sm" className="rounded-2xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
                    Settings
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <ActionConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, actionType: null })}
        onConfirm={handleConfirmAction}
        actionType={confirmDialog.actionType}
        profiles={profiles}
        schedule={schedule}
        currentUser={profile}
      />

      {/* Settings Screen - Full Screen Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50">
          <SetupScreen
            profile={profile}
            onClose={() => setShowSettings(false)}
            onLogout={onLogout}
          />
        </div>
      )}

      {/* Activity Log Screen - Full Screen Modal */}
      {showActivityLog && (
        <div className="fixed inset-0 z-50">
          <ActivityLogScreen
            profile={profile}
            onClose={() => setShowActivityLog(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
