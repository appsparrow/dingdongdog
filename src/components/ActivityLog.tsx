
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Utensils, MapPin, Home } from 'lucide-react';
import { Activity } from '@/pages/Index';

interface ActivityLogProps {
  activities: Activity[];
}

const ActivityLog = ({ activities }: ActivityLogProps) => {
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
      case 'feed': return 'bg-green-500';
      case 'walk': return 'bg-blue-500';
      case 'letout': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Clock className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500">No activities logged yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Use the Actions tab to log feeding, walks, and let-outs
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedActivities)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([dateString, dayActivities]) => (
                <div key={dateString} className="space-y-2">
                  <h3 className="font-semibold text-gray-700 text-sm">
                    {formatDate(new Date(dateString))}
                  </h3>
                  <div className="space-y-2">
                    {dayActivities.map((activity) => {
                      const Icon = getIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full ${getTypeColor(activity.type)}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {getTypeLabel(activity.type)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {activity.caretaker}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {activity.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {activity.notes && (
                              <p className="text-sm text-gray-500 mt-1">
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
