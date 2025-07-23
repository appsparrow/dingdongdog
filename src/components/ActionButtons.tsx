
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
          className={`${type === 'walk' ? 'h-20 w-20' : 'h-28 w-28'} rounded-full flex-col gap-2 text-white shadow-2xl border-0 ${gradient} hover:scale-105 transition-all duration-300 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full"></div>
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className={`${type === 'walk' ? 'text-2xl' : 'text-3xl'}`}>{emoji}</div>
            <span className={`font-bold ${type === 'walk' ? 'text-sm' : 'text-base'}`}>{title}</span>
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

          {/* Date Selection with Today highlighted by default */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">When?</Label>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-2xl border-2 hover:border-purple-300 bg-purple-100 border-purple-300 text-purple-700 font-medium"
              >
                Today
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-2xl border-2 hover:border-purple-300 transition-all duration-200"
              >
                Yesterday
              </Button>
            </div>
          </div>

          {/* Time Period Indicators with current period highlighted */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Time of day</Label>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className={`flex-1 h-12 flex-col gap-1 rounded-2xl border-2 transition-all duration-200 ${
                  currentPeriod === 'morning' 
                    ? 'bg-yellow-100 border-yellow-300 text-yellow-700' 
                    : 'hover:border-purple-300'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="text-xs font-medium">Morning</span>
              </Button>
              <Button
                variant="outline"
                className={`flex-1 h-12 flex-col gap-1 rounded-2xl border-2 transition-all duration-200 ${
                  currentPeriod === 'afternoon' 
                    ? 'bg-orange-100 border-orange-300 text-orange-700' 
                    : 'hover:border-purple-300'
                }`}
              >
                <CloudSun className="h-4 w-4" />
                <span className="text-xs font-medium">Afternoon</span>
              </Button>
              <Button
                variant="outline"
                className={`flex-1 h-12 flex-col gap-1 rounded-2xl border-2 transition-all duration-200 ${
                  currentPeriod === 'evening' 
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                    : 'hover:border-purple-300'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="text-xs font-medium">Evening</span>
              </Button>
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
      <CardContent className="flex flex-col items-center gap-6 py-8">
        {/* Top row: Feed and Let Out as big circles */}
        <div className="flex gap-8 justify-center">
          <ActionDialog
            type="feed"
            icon={Utensils}
            title="Fed"
            instruction={schedule.instructions.feeding}
            emoji="🍽️"
            gradient="bg-gradient-to-r from-green-500 to-emerald-500"
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
        
        {/* Bottom row: Walk as smaller circle, centered */}
        <div className="flex justify-center">
          <ActionDialog
            type="walk"
            icon={MapPin}
            title="Walk"
            instruction={schedule.instructions.walking}
            emoji="🚶"
            gradient="bg-gradient-to-r from-blue-400 to-sky-400"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
