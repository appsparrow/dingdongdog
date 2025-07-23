
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
  phone_number?: string;
}

interface TimeOfDayActionsProps {
  profiles: Profile[];
  onAction: (type: 'feed' | 'walk' | 'letout', timePeriod: 'morning' | 'afternoon' | 'evening', caretakerId: string) => void;
  completedActivities: { [key: string]: boolean };
}

const TimeOfDayActions = ({ profiles, onAction, completedActivities }: TimeOfDayActionsProps) => {
  const timeSlots = [
    { 
      key: 'morning', 
      label: 'Morning', 
      time: '8-9 AM',
      gradient: 'from-yellow-400 to-orange-500'
    },
    { 
      key: 'afternoon', 
      label: 'Afternoon', 
      time: '1-3 PM',
      gradient: 'from-blue-400 to-purple-500'
    },
    { 
      key: 'evening', 
      label: 'Evening', 
      time: '6-8 PM',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const actionTypes = [
    { key: 'feed', label: 'Feed', emoji: '🍽️', size: 'large' },
    { key: 'walk', label: 'Walk', emoji: '🚶', size: 'small' },
    { key: 'letout', label: 'Let Out', emoji: '🏠', size: 'large' }
  ];

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Clock className="h-6 w-6 text-purple-500" />
          Care Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot.key} className="space-y-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-r ${timeSlot.gradient} text-white`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{timeSlot.label}</h3>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {timeSlot.time}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              {actionTypes.map((action) => (
                <div key={action.key} className="space-y-2">
                  <div className="flex justify-center">
                    <div className={`${action.size === 'large' ? 'w-16 h-16' : 'w-12 h-12'} rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-2xl shadow-lg`}>
                      {action.emoji}
                    </div>
                  </div>
                  <p className="text-center font-medium text-gray-700">{action.label}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profiles.map((profile) => {
                      const activityKey = `${action.key}-${timeSlot.key}-${profile.id}`;
                      const isCompleted = completedActivities[activityKey];
                      
                      return (
                        <Button
                          key={profile.id}
                          onClick={() => onAction(action.key as 'feed' | 'walk' | 'letout', timeSlot.key as 'morning' | 'afternoon' | 'evening', profile.id)}
                          variant={isCompleted ? "default" : "outline"}
                          size="sm"
                          className={`rounded-full ${isCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                            : 'hover:bg-purple-50 border-purple-200'
                          }`}
                        >
                          {profile.short_name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TimeOfDayActions;
