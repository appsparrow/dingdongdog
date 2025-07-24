import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, X, Utensils, Home, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
}

interface Activity {
  id: string;
  type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  date: string;
  caretaker_id: string;
  notes?: string;
  created_at: string;
  caretaker?: Profile;
}

interface ActivityLogScreenProps {
  profile: Profile;
  onClose: () => void;
}

const ActivityLogScreen = ({ profile, onClose }: ActivityLogScreenProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedType]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_code', profile.session_code);
      
      setProfiles(profilesData || []);

      // Build query for activities
      let query = supabase
        .from('activities')
        .select('*')
        .eq('date', selectedDate)
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data: activitiesData } = await query;
      
      // Add caretaker information to activities
      const activitiesWithCaretakers: Activity[] = (activitiesData || []).map(activity => ({
        id: activity.id,
        type: activity.type as 'feed' | 'walk' | 'letout',
        time_period: activity.time_period as 'morning' | 'afternoon' | 'evening',
        date: activity.date,
        caretaker_id: activity.caretaker_id,
        notes: activity.notes,
        created_at: activity.created_at,
        caretaker: profilesData?.find(p => p.id === activity.caretaker_id)
      }));
      
      setActivities(activitiesWithCaretakers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load activities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feed':
        return <Utensils className="h-4 w-4" />;
      case 'walk':
        return <Clock className="h-4 w-4" />;
      case 'letout':
        return <Home className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'feed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'walk':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'letout':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTimePeriodColor = (period: string) => {
    switch (period) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-700';
      case 'afternoon':
        return 'bg-orange-100 text-orange-700';
      case 'evening':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="h-full overflow-y-auto">
        <div className="max-w-md mx-auto p-6 pb-20">
          {/* Header */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6 sticky top-0 z-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  Activity Log
                </CardTitle>
                <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Filters */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <Filter className="h-5 w-5 text-blue-500" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-2 focus:border-purple-300 transition-all duration-200"
                />
              </div>

              {/* Activity Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Activity Type</label>
                <div className="flex gap-2">
                  {['all', 'feed', 'walk', 'letout'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      className="rounded-2xl"
                    >
                      {type === 'all' ? 'All' : capitalizeFirst(type)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities List */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No activities found for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 capitalize">
                              {activity.type === 'letout' ? 'Let Out' : activity.type}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {activity.caretaker?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getTimePeriodColor(activity.time_period)} capitalize`}>
                          {activity.time_period}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(activity.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {activity.caretaker?.short_name || 'Unknown'}
                        </div>
                      </div>

                      {activity.notes && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-700">{activity.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogScreen; 