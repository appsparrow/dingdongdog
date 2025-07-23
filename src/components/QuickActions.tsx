
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  name: string;
  short_name: string;
}

interface QuickActionsProps {
  profiles: Profile[];
  onAction: (type: 'feed' | 'walk' | 'letout') => void;
}

const QuickActions = ({ profiles, onAction }: QuickActionsProps) => {
  const actions = [
    { 
      key: 'feed', 
      label: 'Fed', 
      emoji: '🍽️',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      key: 'walk', 
      label: 'Walk', 
      emoji: '🚶',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      key: 'letout', 
      label: 'Let Out', 
      emoji: '🏠',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="text-center text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {actions.map((action) => (
            <Button
              key={action.key}
              onClick={() => onAction(action.key as 'feed' | 'walk' | 'letout')}
              className={`h-24 w-full rounded-full ${action.color} text-white text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">{action.emoji}</div>
                <span>{action.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
