
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker_id: string;
  created_at: string;
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

  const getTimePeriodColor = (timePeriod: string) => {
    switch (timePeriod) {
      case 'morning': return 'bg-yellow-100 text-yellow-800';
      case 'afternoon': return 'bg-blue-100 text-blue-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCaretakerName = (caretakerId: string) => {
    const profile = profiles.find(p => p.id === caretakerId);
    return profile ? profile.short_name : 'Unknown';
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
            <p className="text-sm text-gray-400 mt-1">Start by selecting activities above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <div className="text-2xl">{getActivityEmoji(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getTimePeriodColor(activity.time_period)} rounded-full`}>
                      {activity.time_period}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {getCaretakerName(activity.caretaker_id)}
                    </Badge>
                  </div>
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
