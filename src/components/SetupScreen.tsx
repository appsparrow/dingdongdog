
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Schedule } from '@/pages/Index';

interface SetupScreenProps {
  schedule: Schedule;
  onSave: (schedule: Schedule) => void;
  onClose: () => void;
}

const SetupScreen = ({ schedule, onSave, onClose }: SetupScreenProps) => {
  const [localSchedule, setLocalSchedule] = useState<Schedule>(schedule);

  const handleSave = () => {
    onSave(localSchedule);
    onClose();
  };

  const addTime = (type: 'feedTimes' | 'walkTimes') => {
    const newTime = '12:00';
    setLocalSchedule(prev => ({
      ...prev,
      [type]: [...prev[type], newTime]
    }));
  };

  const removeTime = (type: 'feedTimes' | 'walkTimes', index: number) => {
    setLocalSchedule(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updateTime = (type: 'feedTimes' | 'walkTimes', index: number, value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      [type]: prev[type].map((time, i) => i === index ? value : time)
    }));
  };

  const updateInstruction = (type: 'feeding' | 'walking' | 'letout', value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        [type]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Setup</h1>
        </div>

        <div className="space-y-6">
          {/* Feed Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feeding Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Feed Times</Label>
                {localSchedule.feedTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime('feedTimes', index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTime('feedTimes', index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addTime('feedTimes')}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feed Time
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Feeding Instructions</Label>
                <Textarea
                  value={localSchedule.instructions.feeding}
                  onChange={(e) => updateInstruction('feeding', e.target.value)}
                  placeholder="How much food, what type, any special instructions..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Walk Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Walking Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Walk Times</Label>
                {localSchedule.walkTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime('walkTimes', index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTime('walkTimes', index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addTime('walkTimes')}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Walk Time
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Walking Instructions</Label>
                <Textarea
                  value={localSchedule.instructions.walking}
                  onChange={(e) => updateInstruction('walking', e.target.value)}
                  placeholder="Route, duration, any special instructions..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Let Out Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Let Out Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea
                  value={localSchedule.instructions.letout}
                  onChange={(e) => updateInstruction('letout', e.target.value)}
                  placeholder="Where to let out, how long, any special instructions..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="pb-8">
            <Button
              onClick={handleSave}
              className="w-full"
              size="lg"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
