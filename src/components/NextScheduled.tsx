
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  short_name: string;
}

interface Activity {
  id: string;
  type: 'feed' | 'walk' | 'letout';
  time_period: 'morning' | 'afternoon' | 'evening';
  caretaker_id: string;
  created_at: string;
}

interface NextScheduledProps {
  activities: Activity[];
  profiles: Profile[];
}

const NextScheduled = ({ activities, profiles }: NextScheduledProps) => {
  const getScheduledTime = (type: string) => {
    switch (type) {
      case 'feed': return '06:00 PM';
      case 'walk': return '12:00 PM';
      case 'letout': return '08:00 AM';
      default: return '';
    }
  };

  const getActivityEmoji = (type: string) => {
    switch (type) {
      case 'feed': return '🍽️';
      case 'walk': return '🚶';
      case 'letout': return '🏠';
      default: return '⏰';
    }
  };

  const getCaretakerInitials = (caretakerId: string) => {
    const profile = profiles.find(p => p.id === caretakerId);
    return profile ? profile.short_name : '?';
  };

  const isCompleted = (type: string) => {
    return activities.some(activity => activity.type === type);
  };

  const getCompletedBy = (type: string) => {
    const activity = activities.find(activity => activity.type === type);
    return activity ? getCaretakerInitials(activity.caretaker_id) : null;
  };

  const scheduleItems = [
    { type: 'feed', label: 'Fed' },
    { type: 'walk', label: 'Walked' },
    { type: 'letout', label: 'Let Out' }
  ];

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Clock className="h-6 w-6 text-blue-500" />
          Next Scheduled
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduleItems.map((item) => {
          const completed = isCompleted(item.type);
          const completedBy = getCompletedBy(item.type);
          
          return (
            <div key={item.type} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getActivityEmoji(item.type)}</div>
                <span className="font-medium text-gray-700">{item.label}</span>
                {completed && completedBy && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                      {completedBy}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right">
                {completed ? (
                  <Badge className="bg-green-100 text-green-600 border-0">
                    Done
                  </Badge>
                ) : (
                  <span className="text-blue-500 font-medium">
                    {getScheduledTime(item.type)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NextScheduled;
