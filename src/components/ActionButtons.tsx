
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

  const ActionDialog = ({ type, icon: Icon, title, instruction }: {
    type: 'feed' | 'walk' | 'letout';
    icon: any;
    title: string;
    instruction: string;
  }) => (
    <Dialog open={openDialog === type} onOpenChange={(open) => setOpenDialog(open ? type : null)}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-20 flex-col gap-2 text-white shadow-lg"
          style={{
            backgroundColor: type === 'feed' ? '#10b981' : type === 'walk' ? '#3b82f6' : '#f59e0b'
          }}
        >
          <Icon className="h-6 w-6" />
          <span className="font-semibold">{title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{instruction}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caretaker">Your Name</Label>
            <Input
              id="caretaker"
              value={caretaker}
              onChange={(e) => setCaretaker(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={() => handleAction(type)}
            className="w-full"
            disabled={!caretaker.trim()}
          >
            Mark as {title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-center">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <ActionDialog
            type="feed"
            icon={Utensils}
            title="Fed"
            instruction={schedule.instructions.feeding}
          />
          <ActionDialog
            type="walk"
            icon={MapPin}
            title="Walked"
            instruction={schedule.instructions.walking}
          />
          <ActionDialog
            type="letout"
            icon={Home}
            title="Let Out"
            instruction={schedule.instructions.letout}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;
