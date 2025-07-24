
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

interface Schedule {
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
  letout_count: number;
}

interface ScheduleTimes {
  feed: { [key: string]: boolean };
  walk: { [key: string]: boolean };
  letout: { [key: string]: boolean };
}

interface NextScheduledProps {
  activities: Activity[];
  profiles: Profile[];
  schedule?: Schedule | null;
  scheduleTimes?: ScheduleTimes;
  onScheduleClick?: (type: string, timePeriod: string) => void;
}

const NextScheduled = ({ activities, profiles, schedule, scheduleTimes, onScheduleClick }: NextScheduledProps) => {
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

  const getActivityIcon = (type: string, isCompleted: boolean) => {
    switch (type) {
      case 'feed': 
        return isCompleted ? '🍽️' : '🍽️'; // fed-full.png : fed-empty.png
      case 'walk': 
        return isCompleted ? '🚶' : '🚶'; // walk-full.png : walk-empty.png
      case 'letout': 
        return isCompleted ? '💩' : '💩'; // poop-full.png : poop-empty.png
      default: 
        return '⏰';
    }
  };

  const getActivityIconSrc = (type: string, isCompleted: boolean) => {
    switch (type) {
      case 'feed': 
        return isCompleted ? '/fed-full.png' : '/fed-empty.png';
      case 'walk': 
        return isCompleted ? '/walk-full.png' : '/walk-empty.png';
      case 'letout': 
        return isCompleted ? '/poop-full.png' : '/poop-empty.png';
      default: 
        return '';
    }
  };

  const getCaretakerInitials = (caretakerId: string) => {
    const profile = profiles.find(p => p.id === caretakerId);
    return profile ? profile.short_name : '?';
  };

  const isCompleted = (type: string, timePeriod?: string) => {
    if (timePeriod) {
      return activities.some(activity => activity.type === type && activity.time_period === timePeriod);
    }
    return activities.some(activity => activity.type === type);
  };

  const getCompletedBy = (type: string, timePeriod?: string) => {
    const activity = activities.find(activity => 
      activity.type === type && (!timePeriod || activity.time_period === timePeriod)
    );
    return activity ? getCaretakerInitials(activity.caretaker_id) : null;
  };

  const getScheduledTimes = (type: string) => {
    if (scheduleTimes) {
      const times = scheduleTimes[type as keyof ScheduleTimes];
      return Object.keys(times).filter(time => times[time as keyof typeof times]);
    }
    // Fallback to empty array if no schedule times configured
    return [];
  };

  const getTimeDisplay = (timePeriod: string) => {
    switch (timePeriod) {
      case 'morning': return 'AM';
      case 'afternoon': return 'PM';
      case 'evening': return 'PM';
      default: return '';
    }
  };

  const scheduleItems = [
    { type: 'feed', label: 'Fed', times: getScheduledTimes('feed') },
    { type: 'letout', label: 'Let Out', times: getScheduledTimes('letout') },
    { type: 'walk', label: 'Walked', times: getScheduledTimes('walk') }
  ];

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Clock className="h-6 w-6 text-blue-500" />
          Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduleItems.map((item) => {
          const completed = isCompleted(item.type);
          const completedBy = getCompletedBy(item.type);
          
          return (
            <div key={item.type} className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* <div className="text-2xl">{getActivityEmoji(item.type)}</div> */}
                  <span className="font-normal text-xl text-gray-700">{item.label}</span>
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
                      {/* Done */}
                    </Badge>
                  ) : (
                    <span className="text-blue-500 font-medium">
                      {getScheduledTime(item.type)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progress Indicators with Dynamic Positioning */}
              <div className="flex gap-2">
                {(['morning', 'afternoon', 'evening'] as const).map((timePeriod) => {
                  const isTimeConfigured = item.times.includes(timePeriod);
                  const isTimeCompleted = isTimeConfigured && isCompleted(item.type, timePeriod);
                  const timeCompletedBy = isTimeCompleted ? getCompletedBy(item.type, timePeriod) : null;
                  
                  if (!isTimeConfigured) {
                    return <div key={timePeriod} className="flex-1" />; // Empty space for unconfigured times
                  }
                  
                  return (
                    <div
                      key={timePeriod}
                      className={`flex-1 p-2 rounded-xl text-center transition-all duration-200 cursor-pointer hover:scale-105 ${
                        isTimeCompleted
                          ? 'bg-green-100 border-2 border-green-300'
                          : 'bg-gray-100 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                      onClick={() => onScheduleClick?.(item.type, timePeriod)}
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className={`w-8 h-8 flex items-center justify-center ${
                          isTimeCompleted ? 'opacity-100' : 'opacity-50'
                        }`}>
                          <img 
                            src={getActivityIconSrc(item.type, isTimeCompleted)} 
                            alt={`${item.type} ${timePeriod}`}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextSibling!.textContent = getActivityIcon(item.type, isTimeCompleted);
                            }}
                          />
                          <span className="text-lg hidden">{getActivityIcon(item.type, isTimeCompleted)}</span>
                        </div>
                        <span className={`text-xs font-medium capitalize ${
                          isTimeCompleted ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {timePeriod === 'afternoon' ? 'Noon' : timePeriod}
                        </span>
                        {/* {isTimeCompleted && timeCompletedBy && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                            {timeCompletedBy}
                          </div>
                        )} */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NextScheduled;
