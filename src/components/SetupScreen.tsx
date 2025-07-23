
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  phone_number?: string;
  session_code: string;
  is_admin: boolean;
}

interface Schedule {
  id?: string;
  session_code: string;
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
  letout_count: number;
}

interface SetupScreenProps {
  profile: Profile;
  onClose: () => void;
}

const SetupScreen = ({ profile, onClose }: SetupScreenProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({
    session_code: profile.session_code,
    feeding_instruction: 'Give 1 cup of kibble with treats',
    walking_instruction: 'Walk around the block for 15-20 minutes',
    letout_instruction: 'Let out for 5-10 minutes in the backyard',
    letout_count: 3
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_code', profile.session_code);
      
      setProfiles(profilesData || []);

      // Fetch schedule
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*')
        .eq('session_code', profile.session_code)
        .single();
      
      if (scheduleData) {
        setSchedule(scheduleData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addPerson = () => {
    const newPerson: Profile = {
      id: '',
      name: '',
      short_name: '',
      phone_number: '',
      session_code: profile.session_code,
      is_admin: false
    };
    setProfiles([...profiles, newPerson]);
  };

  const removePerson = (index: number) => {
    const newProfiles = profiles.filter((_, i) => i !== index);
    setProfiles(newProfiles);
  };

  const updatePerson = (index: number, field: keyof Profile, value: string | boolean) => {
    const newProfiles = [...profiles];
    newProfiles[index] = { ...newProfiles[index], [field]: value };
    setProfiles(newProfiles);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save schedule
      const { error: scheduleError } = await supabase
        .from('schedules')
        .upsert(schedule);

      if (scheduleError) throw scheduleError;

      // Save profiles
      for (const person of profiles) {
        if (person.name && person.short_name) {
          if (person.id) {
            // Update existing
            const { error } = await supabase
              .from('profiles')
              .update(person)
              .eq('id', person.id);
            if (error) throw error;
          } else {
            // Insert new
            const { error } = await supabase
              .from('profiles')
              .insert(person);
            if (error) throw error;
          }
        }
      }

      toast({
        title: "Settings Saved",
        description: "All settings have been saved successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Save Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="max-w-md mx-auto p-6">
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
            <p className="text-sm text-gray-500">Configure DingDongDog</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Session Code Display */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Session Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <p className="text-3xl font-bold text-blue-600">{profile.session_code}</p>
                <p className="text-sm text-gray-500 mt-1">Share this code with all caretakers</p>
              </div>
            </CardContent>
          </Card>

          {/* Caretakers Management */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Caretakers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profiles.map((person, index) => (
                <div key={index} className="space-y-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                      {person.short_name || '?'}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Full name"
                        value={person.name}
                        onChange={(e) => updatePerson(index, 'name', e.target.value)}
                        className="h-8 text-sm rounded-xl border-2 focus:border-purple-300"
                      />
                      <Input
                        placeholder="Initials (e.g., JD)"
                        value={person.short_name}
                        onChange={(e) => updatePerson(index, 'short_name', e.target.value.toUpperCase())}
                        className="h-8 text-sm rounded-xl border-2 focus:border-purple-300"
                        maxLength={2}
                      />
                      <Input
                        placeholder="Phone number"
                        value={person.phone_number || ''}
                        onChange={(e) => updatePerson(index, 'phone_number', e.target.value)}
                        className="h-8 text-sm rounded-xl border-2 focus:border-purple-300"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePerson(index)}
                      className="h-8 w-8 rounded-xl hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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

          {/* Instructions */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Feeding Instructions</Label>
                <Textarea
                  value={schedule.feeding_instruction}
                  onChange={(e) => setSchedule({...schedule, feeding_instruction: e.target.value})}
                  placeholder="How much food, what type, any special instructions..."
                  className="resize-none rounded-2xl border-2 focus:border-green-300"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Walking Instructions</Label>
                <Textarea
                  value={schedule.walking_instruction}
                  onChange={(e) => setSchedule({...schedule, walking_instruction: e.target.value})}
                  placeholder="Route, duration, any special instructions..."
                  className="resize-none rounded-2xl border-2 focus:border-blue-300"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Let Out Instructions</Label>
                <Textarea
                  value={schedule.letout_instruction}
                  onChange={(e) => setSchedule({...schedule, letout_instruction: e.target.value})}
                  placeholder="Where to let out, how long, any special instructions..."
                  className="resize-none rounded-2xl border-2 focus:border-orange-300"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Daily Let Out Count</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={schedule.letout_count}
                  onChange={(e) => setSchedule({...schedule, letout_count: parseInt(e.target.value) || 1})}
                  className="rounded-2xl border-2 focus:border-orange-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="pb-8">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full h-14 text-lg font-bold rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
