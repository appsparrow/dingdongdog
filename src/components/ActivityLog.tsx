
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Utensils, MapPin, Home } from 'lucide-react';
import { Activity, Person } from '@/pages/Index';

interface ActivityLogProps {
  activities: Activity[];
  people: Person[];
}

const ActivityLog = ({ activities, people }: ActivityLogProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'feed': return Utensils;
      case 'walk': return MapPin;
      case 'letout': return Home;
      default: return Clock;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feed': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'walk': return 'bg-gradient-to-r from-blue-500 to-sky-500';
      case 'letout': return 'bg-gradient-to-r from-orange-500 to-yellow-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feed': return 'Fed';
      case 'walk': return 'Walked';
      case 'letout': return 'Let Out';
      default: return type;
    }
  };

  const getEmoji = (type: string) => {
    switch (type) {
      case 'feed': return '🍽️';
      case 'walk': return '🚶';
      case 'letout': return '🏠';
      default: return '⏰';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    if (date.toDateString() === today) {
      return 'Today';
    } else if (date.toDateString() === yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupByDate = (activities: Activity[]) => {
    const groups: { [key: string]: Activity[] } = {};
    
    activities.forEach(activity => {
      const dateKey = activity.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    return groups;
  };

  const groupedActivities = groupByDate(activities);

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
            <Clock className="h-5 w-5 text-white" />
          </div>
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🐕</div>
            <p className="text-gray-500 text-lg font-medium">No activities logged yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the Actions tab to log feeding, walks, and let-outs
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([dateString, dayActivities]) => (
                <div key={dateString} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent flex-1"></div>
                    <h3 className="font-bold text-gray-700 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full text-sm">
                      {formatDate(new Date(dateString))}
                    </h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent flex-1"></div>
                  </div>
                  <div className="space-y-3">
                    {dayActivities
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((activity) => {
                        const person = people.find(p => p.id === activity.caretakerId);
                        return (
                          <div key={activity.id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                            <div className={`p-3 rounded-2xl ${getTypeColor(activity.type)} shadow-lg`}>
                              <div className="text-2xl">{getEmoji(activity.type)}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-gray-900 text-lg">
                                  {getTypeLabel(activity.type)}
                                </span>
                                {person && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                                      {person.shortName}
                                    </div>
                                    <Badge variant="secondary" className="text-xs rounded-full bg-white/80 border-purple-200 text-purple-700">
                                      {person.name.split(' ')[0]}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 font-medium">
                                {activity.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              {activity.notes && (
                                <p className="text-sm text-gray-500 mt-2 p-2 bg-white/60 rounded-xl">
                                  {activity.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
