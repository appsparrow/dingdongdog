
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCheck } from 'lucide-react';

interface Activity {
  id: string;
  type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker_id: string;
  created_at: string;
  notes?: string;
}

interface Profile {
  id: string;
  name: string;
  short_name: string;
}

interface TodayActivityProps {
  activities: Activity[];
  profiles: Profile[];
}

const TodayActivity = ({ activities, profiles }: TodayActivityProps) => {
  const getActivityEmoji = (type: string) => {
    switch (type) {
      case 'feed': return '🍽️';
      case 'walk': return '🚶';
      case 'letout': return '🏠';
      default: return '⏰';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'feed': return 'Fed';
      case 'walk': return 'Walked';
      case 'letout': return 'Let Out';
      default: return type;
    }
  };

  const getCaretakerName = (caretakerId: string) => {
    const profile = profiles.find(p => p.id === caretakerId);
    return profile ? profile.name : 'Unknown';
  };

  const getCaretakerInitials = (caretakerId: string) => {
    const profile = profiles.find(p => p.id === caretakerId);
    return profile ? profile.short_name : '?';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          <Clock className="h-6 w-6 text-green-500" />
          Today's Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🐕</div>
            <p className="text-gray-500">No activities logged today</p>
            <p className="text-sm text-gray-400 mt-1">Use Quick Actions to record activities!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getActivityEmoji(activity.type)}</div>
                  <div>
                    <p className="font-medium text-gray-700">{getActivityLabel(activity.type)}</p>
                    <p className="text-sm text-gray-500">by {getCaretakerName(activity.caretaker_id)}</p>
                    {activity.notes && (
                      <p className="text-xs text-gray-400 mt-1">{activity.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatTime(activity.created_at)}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-600 border-0">
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayActivity;
