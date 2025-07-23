
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

interface ActionConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (caretakerId: string, notes?: string) => void;
  actionType: 'feed' | 'walk' | 'letout' | null;
  profiles: Profile[];
}

const ActionConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  actionType, 
  profiles 
}: ActionConfirmDialogProps) => {
  const [selectedCaretaker, setSelectedCaretaker] = useState<string>('');
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

  const handleConfirm = () => {
    if (selectedCaretaker) {
      onConfirm(selectedCaretaker, notes || undefined);
      setNotes('');
      setSelectedCaretaker('');
      onClose();
    }
  };

  const handleClose = () => {
    setNotes('');
    setSelectedCaretaker('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getActionEmoji(actionType)}</span>
            Record {getActionLabel(actionType)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Who did this?</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {profiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant={selectedCaretaker === profile.id ? "default" : "outline"}
                  onClick={() => setSelectedCaretaker(profile.id)}
                  className="h-12"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                      {profile.short_name}
                    </div>
                    <span className="text-sm">{profile.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this activity..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedCaretaker}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Record Activity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActionConfirmDialog;
