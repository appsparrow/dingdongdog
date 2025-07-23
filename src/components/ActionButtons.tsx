
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Utensils, MapPin, Home, Sun, CloudSun, Moon } from 'lucide-react';
import { Schedule, Person } from '@/pages/Index';

interface ActionButtonsProps {
  onAction: (type: 'feed' | 'walk' | 'letout', caretakerId: string, notes?: string) => void;
  schedule: Schedule;
}

const ActionButtons = ({ onAction, schedule }: ActionButtonsProps) => {
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [openDialog, setOpenDialog] = useState<'feed' | 'walk' | 'letout' | null>(null);

  const handleAction = (type: 'feed' | 'walk' | 'letout') => {
    if (!selectedPerson) return;
    
    onAction(type, selectedPerson, notes || undefined);
    setNotes('');
    setOpenDialog(null);
  };

  const getTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getTimePeriodIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Sun className="h-4 w-4" />;
      case 'afternoon': return <CloudSun className="h-4 w-4" />;
      case 'evening': return <Moon className="h-4 w-4" />;
      default: return <Sun className="h-4 w-4" />;
    }
  };

  const isToday = new Date().toDateString() === new Date().toDateString();
  const currentPeriod = getTimePeriod();

  const ActionDialog = ({ type, icon: Icon, title, instruction, emoji, gradient }: {
    type: 'feed' | 'walk' | 'letout';
    icon: any;
    title: string;
    instruction: string;
    emoji: string;
    gradient: string;
  }) => (
    <Dialog open={openDialog === type} onOpenChange={(open) => {
      setOpenDialog(open ? type : null);
      if (!open) {
        setSelectedPerson('');
        setNotes('');
      }
    }}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={`h-24 flex-col gap-3 text-white shadow-2xl rounded-3xl border-0 ${gradient} hover:scale-105 transition-all duration-300 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="text-3xl">{emoji}</div>
            <span className="font-bold text-lg">{title}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
            <span className="text-3xl">{emoji}</span>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
            <p className="text-sm text-gray-700 leading-relaxed">{instruction}</p>
          </div>

          {/* Time Period Indicator */}
          <div className="flex items-center justify-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${
                currentPeriod === 'morning' ? 'bg-yellow-200' : 'bg-gray-200'
              }`}>
                <Sun className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Morning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${
                currentPeriod === 'afternoon' ? 'bg-orange-200' : 'bg-gray-200'
              }`}>
                <CloudSun className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Afternoon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${
                currentPeriod === 'evening' ? 'bg-indigo-200' : 'bg-gray-200'
              }`}>
                <Moon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Evening</span>
            </div>
          </div>

          {/* Person Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Who's taking care?</Label>
            <div className="grid grid-cols-2 gap-3">
              {schedule.people.map((person) => (
                <Button
                  key={person.id}
                  variant={selectedPerson === person.id ? "default" : "outline"}
                  onClick={() => setSelectedPerson(person.id)}
                  className={`h-16 flex-col gap-2 rounded-2xl transition-all duration-200 ${
                    selectedPerson === person.id 
                      ? `${gradient} text-white shadow-lg` 
                      : 'border-2 hover:border-purple-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                    {person.shortName}
                  </div>
                  <span className="text-xs font-medium">{person.name.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="resize-none rounded-2xl border-2 focus:border-purple-300 transition-all duration-200"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={() => handleAction(type)}
            className={`w-full h-12 rounded-2xl ${gradient} hover:scale-105 transition-all duration-300 font-bold text-lg shadow-lg`}
            disabled={!selectedPerson}
          >
            <span className="mr-2">{emoji}</span>
            Mark as {title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <ActionDialog
            type="feed"
            icon={Utensils}
            title="Fed"
            instruction={schedule.instructions.feeding}
            emoji="🍽️"
            gradient="bg-gradient-to-r from-green-500 to-emerald-500"
          />
          <ActionDialog
            type="walk"
            icon={MapPin}
            title="Walked"
            instruction={schedule.instructions.walking}
            emoji="🚶"
            gradient="bg-gradient-to-r from-blue-500 to-sky-500"
          />
          <ActionDialog
            type="letout"
            icon={Home}
            title="Let Out"
            instruction={schedule.instructions.letout}
            emoji="🏠"
            gradient="bg-gradient-to-r from-orange-500 to-yellow-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
