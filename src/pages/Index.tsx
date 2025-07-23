
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import NextScheduled from '@/components/NextScheduled';
import QuickActions from '@/components/QuickActions';
import ActionConfirmDialog from '@/components/ActionConfirmDialog';

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
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    actionType: 'feed' | 'walk' | 'letout' | null;
  }>({ open: false, actionType: null });
  const { toast } = useToast();
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (type: 'feed' | 'walk' | 'letout') => {
    setConfirmDialog({ open: true, actionType: type });
  };

  const handleConfirmAction = async (caretakerId: string, notes?: string) => {
    if (!confirmDialog.actionType) return;

    try {
      // Insert activity
      const { error } = await supabase
        .from('activities')
        .insert({
          type: confirmDialog.actionType,
          time_period: 'morning', // We'll simplify this for now
          date: today,
          caretaker_id: caretakerId,
          notes
        });

      if (error) throw error;

      const caretaker = profiles.find(p => p.id === caretakerId);
      
      // Show success notification
      toast({
        title: "Activity Recorded",
        description: `${caretaker?.name} recorded: ${confirmDialog.actionType}`,
        variant: "default"
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error inserting activity:', error);
      toast({
        title: "Error",
        description: "Failed to record activity. Please try again.",
        variant: "destructive"
      });
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

        {/* Next Scheduled */}
        {isLoading ? (
          <div className="text-center text-gray-500 mb-6">Loading...</div>
        ) : (
          <div className="mb-6">
            <NextScheduled activities={activities} profiles={profiles} />
          </div>
        )}

        {/* Quick Actions */}
        {!isLoading && (
          <QuickActions profiles={profiles} onAction={handleQuickAction} />
        )}

        {/* Action Confirmation Dialog */}
        <ActionConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, actionType: null })}
          onConfirm={handleConfirmAction}
          actionType={confirmDialog.actionType}
          profiles={profiles}
        />
      </div>
    </div>
  );
};

export default Index;
