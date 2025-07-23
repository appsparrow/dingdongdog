
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Profile {
  id: string;
  name: string;
  short_name: string;
}

interface Schedule {
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
}

interface ActionConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (caretakerId: string, timePeriod: string, date: string, notes?: string) => void;
  actionType: 'feed' | 'walk' | 'letout' | null;
  profiles: Profile[];
  schedule?: Schedule;
}

const ActionConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  actionType, 
  profiles,
  schedule
}: ActionConfirmDialogProps) => {
  const [selectedCaretaker, setSelectedCaretaker] = useState<string>('');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('morning');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [notes, setNotes] = useState('');

  const getActionEmoji = (type: string | null) => {
    switch (type) {
      case 'feed': return '🍽️';
      case 'walk': return '🚶';
      case 'letout': return '🏠';
      default: return '⏰';
    }
  };

  const getActionLabel = (type: string | null) => {
    switch (type) {
      case 'feed': return 'Fed';
      case 'walk': return 'Walked';
      case 'letout': return 'Let Out';
      default: return 'Action';
    }
  };

  const getInstructions = (type: string | null) => {
    if (!schedule) return '';
    switch (type) {
      case 'feed': return schedule.feeding_instruction;
      case 'walk': return schedule.walking_instruction;
      case 'letout': return schedule.letout_instruction;
      default: return '';
    }
  };

  const handleConfirm = () => {
    if (selectedCaretaker) {
      const actualDate = selectedDate === 'today' 
        ? new Date().toISOString().slice(0, 10)
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      
      onConfirm(selectedCaretaker, selectedTimePeriod, actualDate, notes || undefined);
      setNotes('');
      setSelectedCaretaker('');
      setSelectedTimePeriod('morning');
      setSelectedDate('today');
      onClose();
    }
  };

  const handleClose = () => {
    setNotes('');
    setSelectedCaretaker('');
    setSelectedTimePeriod('morning');
    setSelectedDate('today');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getActionEmoji(actionType)}</span>
            {getActionLabel(actionType)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructions */}
          {getInstructions(actionType) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 text-center">{getInstructions(actionType)}</p>
            </div>
          )}

          {/* When? */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">When?</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedDate === 'today' ? "default" : "outline"}
                onClick={() => setSelectedDate('today')}
                className="rounded-full"
              >
                Today
              </Button>
              <Button
                variant={selectedDate === 'yesterday' ? "default" : "outline"}
                onClick={() => setSelectedDate('yesterday')}
                className="rounded-full"
              >
                Yesterday
              </Button>
            </div>
          </div>

          {/* Time of day */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Time of day</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedTimePeriod === 'morning' ? "default" : "outline"}
                onClick={() => setSelectedTimePeriod('morning')}
                className="rounded-full flex flex-col items-center py-4 h-auto"
              >
                <span className="text-lg">☀️</span>
                <span className="text-sm">Morning</span>
              </Button>
              <Button
                variant={selectedTimePeriod === 'afternoon' ? "default" : "outline"}
                onClick={() => setSelectedTimePeriod('afternoon')}
                className="rounded-full flex flex-col items-center py-4 h-auto"
              >
                <span className="text-lg">🌤️</span>
                <span className="text-sm">Afternoon</span>
              </Button>
              <Button
                variant={selectedTimePeriod === 'evening' ? "default" : "outline"}
                onClick={() => setSelectedTimePeriod('evening')}
                className="rounded-full flex flex-col items-center py-4 h-auto"
              >
                <span className="text-lg">🌙</span>
                <span className="text-sm">Evening</span>
              </Button>
            </div>
          </div>
          
          {/* Who's taking care? */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Who's taking care?</Label>
            <div className="grid grid-cols-2 gap-2">
              {profiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant={selectedCaretaker === profile.id ? "default" : "outline"}
                  onClick={() => setSelectedCaretaker(profile.id)}
                  className="h-16 rounded-2xl flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                    {profile.short_name}
                  </div>
                  <span className="text-sm">{profile.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-2xl"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedCaretaker}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-lg font-medium"
          >
            Mark as {getActionLabel(actionType)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActionConfirmDialog;
