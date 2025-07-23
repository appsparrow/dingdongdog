
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Utensils, MapPin, Home } from 'lucide-react';
import { Schedule } from '@/pages/Index';

interface ActionButtonsProps {
  onAction: (type: 'feed' | 'walk' | 'letout', caretaker: string, notes?: string) => void;
  schedule: Schedule;
}

const ActionButtons = ({ onAction, schedule }: ActionButtonsProps) => {
  const [caretaker, setCaretaker] = useState('');
  const [notes, setNotes] = useState('');
  const [openDialog, setOpenDialog] = useState<'feed' | 'walk' | 'letout' | null>(null);

  const handleAction = (type: 'feed' | 'walk' | 'letout') => {
    if (!caretaker.trim()) return;
    
    onAction(type, caretaker, notes || undefined);
    setNotes('');
    setOpenDialog(null);
  };

  const ActionDialog = ({ type, icon: Icon, title, instruction, emoji, gradient }: {
    type: 'feed' | 'walk' | 'letout';
    icon: any;
    title: string;
    instruction: string;
    emoji: string;
    gradient: string;
  }) => (
    <Dialog open={openDialog === type} onOpenChange={(open) => setOpenDialog(open ? type : null)}>
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
          
          <div className="space-y-2">
            <Label htmlFor="caretaker" className="text-sm font-medium text-gray-700">Your Name</Label>
            <Input
              id="caretaker"
              value={caretaker}
              onChange={(e) => setCaretaker(e.target.value)}
              placeholder="Enter your name"
              className="rounded-2xl border-2 focus:border-purple-300 transition-all duration-200"
            />
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
            disabled={!caretaker.trim()}
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
