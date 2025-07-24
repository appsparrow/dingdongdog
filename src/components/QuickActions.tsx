
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
      color: 'bg-gradient-to-r from-green-400 to-green-600'
    },
    { 
      key: 'walk', 
      label: 'Walk', 
      emoji: '🚶',
      color: 'bg-gradient-to-r from-blue-400 to-blue-600'
    },
    { 
      key: 'letout', 
      label: 'Let Out', 
      emoji: '🏠',
      color: 'bg-gradient-to-r from-orange-400 to-orange-600'
    }
  ];

  const getActionIcon = (action: typeof actions[0]) => (
    <div className="text-4xl">{action.emoji}</div>
  );

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="text-center text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Top row - Fed and Let Out (big circles) */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onAction('feed')}
              className="h-32 w-full rounded-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-2">
                {getActionIcon(actions[0])}
                <span>Fed</span>
              </div>
            </Button>
            <Button
              onClick={() => onAction('letout')}
              className="h-32 w-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-2">
                {getActionIcon(actions[2])}
                <span>Let Out</span>
              </div>
            </Button>
          </div>

          {/* Bottom row - Walk (centered) */}
          <div className="flex justify-center">
            <Button
              onClick={() => onAction('walk')}
              className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-xl font-bold shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-2">
                {getActionIcon(actions[1])}
                <span>Walk</span>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
