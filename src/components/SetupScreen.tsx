
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Users } from 'lucide-react';
import { Schedule, Person } from '@/pages/Index';

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

  const addPerson = () => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name: '',
      shortName: '',
      avatar: '/lovable-uploads/029f3257-eb87-41b5-99bd-74cb8a353960.png'
    };
    setLocalSchedule(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));
  };

  const removePerson = (id: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      people: prev.people.filter(p => p.id !== id)
    }));
  };

  const updatePerson = (id: string, field: keyof Person, value: string) => {
    setLocalSchedule(prev => ({
      ...prev,
      people: prev.people.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const updateLetoutCount = (count: number) => {
    setLocalSchedule(prev => ({
      ...prev,
      letoutCount: Math.max(1, count)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-2xl hover:bg-white/80 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Setup
            </h1>
            <p className="text-sm text-gray-500">Configure your pup's schedule</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* People Management */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-2xl">👥</span>
                Caretakers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {localSchedule.people.map((person) => (
                <div key={person.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {person.shortName || '?'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Full name"
                      value={person.name}
                      onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                      className="h-8 text-sm rounded-xl border-2 focus:border-purple-300"
                    />
                    <Input
                      placeholder="Initials (e.g., JD)"
                      value={person.shortName}
                      onChange={(e) => updatePerson(person.id, 'shortName', e.target.value.toUpperCase())}
                      className="h-8 text-sm rounded-xl border-2 focus:border-purple-300"
                      maxLength={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePerson(person.id)}
                    className="h-8 w-8 rounded-xl hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addPerson}
                className="w-full rounded-2xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Caretaker
              </Button>
            </CardContent>
          </Card>

          {/* Feed Times */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                Feeding Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Feed Times</Label>
                {localSchedule.feedTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime('feedTimes', index, e.target.value)}
                      className="flex-1 rounded-2xl border-2 focus:border-green-300 transition-all duration-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTime('feedTimes', index)}
                      className="h-10 w-10 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addTime('feedTimes')}
                  className="w-full rounded-2xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feed Time
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Feeding Instructions</Label>
                <Textarea
                  value={localSchedule.instructions.feeding}
                  onChange={(e) => updateInstruction('feeding', e.target.value)}
                  placeholder="How much food, what type, any special instructions..."
                  className="resize-none rounded-2xl border-2 focus:border-green-300 transition-all duration-200"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Walk Times */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-2xl">🚶</span>
                Walking Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Walk Times</Label>
                {localSchedule.walkTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime('walkTimes', index, e.target.value)}
                      className="flex-1 rounded-2xl border-2 focus:border-blue-300 transition-all duration-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTime('walkTimes', index)}
                      className="h-10 w-10 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addTime('walkTimes')}
                  className="w-full rounded-2xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Walk Time
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Walking Instructions</Label>
                <Textarea
                  value={localSchedule.instructions.walking}
                  onChange={(e) => updateInstruction('walking', e.target.value)}
                  placeholder="Route, duration, any special instructions..."
                  className="resize-none rounded-2xl border-2 focus:border-blue-300 transition-all duration-200"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Let Out Instructions */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                Let Out Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Daily Let Out Count</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={localSchedule.letoutCount}
                  onChange={(e) => updateLetoutCount(parseInt(e.target.value) || 1)}
                  className="rounded-2xl border-2 focus:border-orange-300 transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Instructions</Label>
                <Textarea
                  value={localSchedule.instructions.letout}
                  onChange={(e) => updateInstruction('letout', e.target.value)}
                  placeholder="Where to let out, how long, any special instructions..."
                  className="resize-none rounded-2xl border-2 focus:border-orange-300 transition-all duration-200"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="pb-8">
            <Button
              onClick={handleSave}
              className="w-full h-14 text-lg font-bold rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <span className="mr-2">✨</span>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
