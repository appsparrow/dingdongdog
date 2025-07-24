import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, X, Plus, Clock, Utensils, Home, Trash2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
  phone_number?: string;
}

interface Schedule {
  id: string;
  session_code: string;
  feeding_instruction: string;
  walking_instruction: string;
  letout_instruction: string;
  letout_count: number;
}

interface AdminSetupScreenProps {
  profile: Profile;
  onClose: () => void;
}

const AdminSetupScreen = ({ profile, onClose }: AdminSetupScreenProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newCaretakerName, setNewCaretakerName] = useState('');
  const [newCaretakerShortName, setNewCaretakerShortName] = useState('');
  const [newCaretakerPhone, setNewCaretakerPhone] = useState('');
  const [newCaretakerCode, setNewCaretakerCode] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [editingCaretakerId, setEditingCaretakerId] = useState<string | null>(null);
  const [editingCaretakerCode, setEditingCaretakerCode] = useState('');
  const [editingAdminPasscode, setEditingAdminPasscode] = useState(false);
  const [newAdminPasscode, setNewAdminPasscode] = useState('');
  const [showAddCaretaker, setShowAddCaretaker] = useState(false);
  const [swipedCaretakerId, setSwipedCaretakerId] = useState<string | null>(null);
  const { toast } = useToast();

  // Schedule configuration
  const [feedingInstruction, setFeedingInstruction] = useState('');
  const [walkingInstruction, setWalkingInstruction] = useState('');
  const [letoutInstruction, setLetoutInstruction] = useState('');
  const [letoutCount, setLetoutCount] = useState(3);

  // Schedule times configuration
  const [feedTimes, setFeedTimes] = useState<{ [key: string]: boolean }>({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [walkTimes, setWalkTimes] = useState<{ [key: string]: boolean }>({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [letoutTimes, setLetoutTimes] = useState<{ [key: string]: boolean }>({
    morning: false,
    afternoon: false,
    evening: false
  });

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
        setFeedingInstruction(scheduleData.feeding_instruction);
        setWalkingInstruction(scheduleData.walking_instruction);
        setLetoutInstruction(scheduleData.letout_instruction);
        setLetoutCount(scheduleData.letout_count);
        
        // Fetch schedule times
        const { data: scheduleTimesData } = await supabase
          .from('schedule_times')
          .select('*')
          .eq('schedule_id', scheduleData.id);
        
        // Reset all times to false first
        setFeedTimes({ morning: false, afternoon: false, evening: false });
        setWalkTimes({ morning: false, afternoon: false, evening: false });
        setLetoutTimes({ morning: false, afternoon: false, evening: false });
        
        // Set times based on database data
        if (scheduleTimesData) {
          scheduleTimesData.forEach((timeEntry) => {
            const { activity_type, time_period } = timeEntry;
            switch (activity_type) {
              case 'feed':
                setFeedTimes(prev => ({ ...prev, [time_period]: true }));
                break;
              case 'walk':
                setWalkTimes(prev => ({ ...prev, [time_period]: true }));
                break;
              case 'letout':
                setLetoutTimes(prev => ({ ...prev, [time_period]: true }));
                break;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddCaretaker = async () => {
    if (!newCaretakerName.trim() || !newCaretakerShortName.trim() || !newCaretakerCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter name, short name, and code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          name: newCaretakerName.trim(),
          short_name: newCaretakerShortName.trim().toUpperCase(),
          phone_number: newCaretakerCode.trim(),
          session_code: profile.session_code,
          is_admin: false
        });

      if (error) throw error;

      toast({
        title: "Caretaker Added",
        description: `${newCaretakerName} has been added successfully!`,
        variant: "default"
      });

      setNewCaretakerName('');
      setNewCaretakerShortName('');
      setNewCaretakerPhone('');
      setNewCaretakerCode('');
      setShowAddCaretaker(false);
      fetchData();
    } catch (error) {
      console.error('Error adding caretaker:', error);
      toast({
        title: "Error",
        description: "Failed to add caretaker. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdminCode = async () => {
    if (!newAdminCode.trim()) {
      toast({
        title: "Missing Admin Code",
        description: "Please enter a new admin code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ session_code: newAdminCode.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Admin Code Updated",
        description: "Admin code has been updated successfully!",
        variant: "default"
      });

      setNewAdminCode('');
      fetchData();
    } catch (error) {
      console.error('Error updating admin code:', error);
      toast({
        title: "Error",
        description: "Failed to update admin code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setIsLoading(true);
    try {
      let scheduleId = schedule?.id;

      if (!scheduleId) {
        // Create new schedule
        const { data: newSchedule, error: scheduleError } = await supabase
          .from('schedules')
          .insert({
            session_code: profile.session_code,
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
            letout_count: letoutCount
          })
          .select()
          .single();

        if (scheduleError) throw scheduleError;
        scheduleId = newSchedule.id;
      } else {
        // Update existing schedule
        const { error: scheduleError } = await supabase
          .from('schedules')
          .update({
            feeding_instruction: feedingInstruction,
            walking_instruction: walkingInstruction,
            letout_instruction: letoutInstruction,
            letout_count: letoutCount
          })
          .eq('id', scheduleId);

        if (scheduleError) throw scheduleError;
      }

      // Save schedule times
      const { error: timesError } = await supabase
        .from('schedule_times')
        .delete()
        .eq('schedule_id', scheduleId);

      if (timesError) throw timesError;

      const timesToSave = [];
      for (const [period, isActive] of Object.entries(feedTimes)) {
        if (isActive) {
          timesToSave.push({
            schedule_id: scheduleId,
            activity_type: 'feed',
            time_period: period,
            time_of_day: period
          });
        }
      }
      for (const [period, isActive] of Object.entries(walkTimes)) {
        if (isActive) {
          timesToSave.push({
            schedule_id: scheduleId,
            activity_type: 'walk',
            time_period: period,
            time_of_day: period
          });
        }
      }
      for (const [period, isActive] of Object.entries(letoutTimes)) {
        if (isActive) {
          timesToSave.push({
            schedule_id: scheduleId,
            activity_type: 'letout',
            time_period: period,
            time_of_day: period
          });
        }
      }

      if (timesToSave.length > 0) {
        const { error: timesInsertError } = await supabase
          .from('schedule_times')
          .insert(timesToSave);

        if (timesInsertError) throw timesInsertError;
      }

      toast({
        title: "Schedule Saved",
        description: "Your schedule has been updated successfully!",
        variant: "default"
      });

      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCaretaker = async (caretakerId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', caretakerId);

      if (error) throw error;

      toast({
        title: "Caretaker Removed",
        description: "Caretaker has been removed successfully!",
        variant: "default"
      });

      fetchData();
    } catch (error) {
      console.error('Error removing caretaker:', error);
      toast({
        title: "Error",
        description: "Failed to remove caretaker. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartEditCaretakerCode = (caretakerId: string, currentCode: string) => {
    setEditingCaretakerId(caretakerId);
    setEditingCaretakerCode(currentCode);
  };

  const handleCancelEditCaretakerCode = () => {
    setEditingCaretakerId(null);
    setEditingCaretakerCode('');
  };

  const handleUpdateCaretakerCode = async () => {
    if (!editingCaretakerId || !editingCaretakerCode.trim()) {
      toast({
        title: "Missing Code",
        description: "Please enter a caretaker code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: editingCaretakerCode.trim() })
        .eq('id', editingCaretakerId);

      if (error) throw error;

      toast({
        title: "Caretaker Code Updated",
        description: "Caretaker code has been updated successfully!",
        variant: "default"
      });

      setEditingCaretakerId(null);
      setEditingCaretakerCode('');
      fetchData();
    } catch (error) {
      console.error('Error updating caretaker code:', error);
      toast({
        title: "Error",
        description: "Failed to update caretaker code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAdminPasscode = async () => {
    if (!newAdminPasscode.trim()) {
      toast({
        title: "Missing Passcode",
        description: "Please enter a new passcode",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: newAdminPasscode.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Passcode Updated",
        description: "Your passcode has been updated successfully!",
        variant: "default"
      });

      setNewAdminPasscode('');
      setEditingAdminPasscode(false);
      fetchData();
    } catch (error) {
      console.error('Error updating admin passcode:', error);
      toast({
        title: "Error",
        description: "Failed to update passcode. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeStart = (e: React.TouchEvent, caretakerId: string) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleSwipeMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const diffX = startX - currentX;
      
      if (diffX > 50) { // Swipe left threshold
        setSwipedCaretakerId(caretakerId);
      }
    };
    
    const handleSwipeEnd = () => {
      document.removeEventListener('touchmove', handleSwipeMove);
      document.removeEventListener('touchend', handleSwipeEnd);
    };
    
    document.addEventListener('touchmove', handleSwipeMove);
    document.addEventListener('touchend', handleSwipeEnd);
  };

  const handleSwipeDelete = (caretakerId: string) => {
    setSwipedCaretakerId(null);
    handleRemoveCaretaker(caretakerId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="h-full overflow-y-auto">
        <div className="max-w-md mx-auto p-6 pb-20">
          {/* Header */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6 sticky top-0 z-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <Settings className="h-6 w-6 text-purple-500" />
                  Owner Setup
                </CardTitle>
                <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Session Info */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Code Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Admin Code:</span>
                <Badge variant="outline" className="text-lg font-bold">
                  {profile.session_code}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="newAdminCode">New Admin Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="newAdminCode"
                    placeholder="Enter new admin code"
                    value={newAdminCode}
                    onChange={(e) => setNewAdminCode(e.target.value)}
                    className="rounded-2xl flex-1"
                  />
                  <Button
                    onClick={handleUpdateAdminCode}
                    disabled={isLoading || !newAdminCode.trim()}
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Admin Passcode Update */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium text-gray-700">Update Your User Code</Label>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-3">
                  <span className="text-gray-600">Current User Code:</span>
                  <Badge variant="outline" className="text-lg font-bold">
                    {profile.phone_number || 'Not set'}
                  </Badge>
                </div>
                {editingAdminPasscode ? (
                  <div className="flex gap-2">
                    <Input
                      value={newAdminPasscode}
                      onChange={(e) => setNewAdminPasscode(e.target.value)}
                      placeholder="Enter new user code"
                      maxLength={4}
                      className="rounded-2xl flex-1"
                    />
                    <Button
                      onClick={handleUpdateAdminPasscode}
                      disabled={isLoading || !newAdminPasscode.trim()}
                      className="rounded-2xl bg-blue-500 hover:bg-blue-600"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingAdminPasscode(false);
                        setNewAdminPasscode('');
                      }}
                      variant="outline"
                      className="rounded-2xl"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setEditingAdminPasscode(true)}
                    variant="outline"
                    className="w-full rounded-2xl"
                  >
                    Change User Code
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Caretakers Section */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                <Users className="h-5 w-5 text-green-500" />
                Current Caretakers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Caretakers List */}
              <div className="space-y-3">
                {profiles.map((caretaker) => (
                  <div
                    key={caretaker.id}
                    className={`relative flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl transition-all duration-200 ${
                      swipedCaretakerId === caretaker.id ? 'transform -translate-x-16' : ''
                    }`}
                    onTouchStart={(e) => !caretaker.is_admin && handleSwipeStart(e, caretaker.id)}
                    onClick={() => swipedCaretakerId === caretaker.id && setSwipedCaretakerId(null)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {caretaker.short_name}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{caretaker.name}</p>
                        {editingCaretakerId === caretaker.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              value={editingCaretakerCode}
                              onChange={(e) => setEditingCaretakerCode(e.target.value)}
                              placeholder="Enter code"
                              maxLength={4}
                              className="w-20 h-8 text-sm rounded-xl"
                            />
                            <Button
                              onClick={handleUpdateCaretakerCode}
                              size="sm"
                              className="h-8 px-2 bg-green-500 hover:bg-green-600"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={handleCancelEditCaretakerCode}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-gray-500"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">
                              Code: {caretaker.phone_number || 'Not set'}
                            </p>
                            {!caretaker.is_admin && (
                              <Button
                                onClick={() => handleStartEditCaretakerCode(caretaker.id, caretaker.phone_number || '')}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 text-blue-500 hover:text-blue-700"
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {caretaker.is_admin && (
                        <Badge variant="default">Owner</Badge>
                      )}
                      {!caretaker.is_admin && editingCaretakerId !== caretaker.id && (
                        <Button
                          onClick={() => handleRemoveCaretaker(caretaker.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Swipe Delete Button */}
                    {!caretaker.is_admin && (
                      <div className={`absolute right-0 top-0 h-full w-16 bg-red-500 rounded-r-2xl flex items-center justify-center transition-all duration-200 ${
                        swipedCaretakerId === caretaker.id ? 'translate-x-0' : 'translate-x-full'
                      }`}>
                        <Button
                          onClick={() => handleSwipeDelete(caretaker.id)}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:text-white hover:bg-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Caretaker Button */}
              <Button
                onClick={() => setShowAddCaretaker(!showAddCaretaker)}
                className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showAddCaretaker ? 'Cancel' : 'Add Caretaker'}
              </Button>

              {/* Add Caretaker Form - Expandable */}
              {showAddCaretaker && (
                <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={newCaretakerName}
                        onChange={(e) => setNewCaretakerName(e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shortName">Short Name</Label>
                      <Input
                        id="shortName"
                        placeholder="JD"
                        maxLength={2}
                        value={newCaretakerShortName}
                        onChange={(e) => setNewCaretakerShortName(e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="caretakerCode">Caretaker Code (Last 4 digits of phone)</Label>
                    <Input
                      id="caretakerCode"
                      placeholder="1234"
                      maxLength={4}
                      value={newCaretakerCode}
                      onChange={(e) => setNewCaretakerCode(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Full Phone (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="Full phone number"
                      value={newCaretakerPhone}
                      onChange={(e) => setNewCaretakerPhone(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>

                  <Button
                    onClick={handleAddCaretaker}
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Caretaker'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feeding Schedule */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                <Utensils className="h-5 w-5 text-green-500" />
                Feeding Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Feed Times</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={feedTimes[period] ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFeedTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                      className="rounded-2xl capitalize"
                    >
                      {feedTimes[period] && <Check className="h-3 w-3 mr-1" />}
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="feedingInstruction">Feeding Instructions</Label>
                <Textarea
                  id="feedingInstruction"
                  placeholder="Give 1/2 cup food and let him out before"
                  value={feedingInstruction}
                  onChange={(e) => setFeedingInstruction(e.target.value)}
                  className="rounded-2xl"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Walking Schedule */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                <Clock className="h-5 w-5 text-blue-500" />
                Walking Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Walk Times</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={walkTimes[period] ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWalkTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                      className="rounded-2xl capitalize"
                    >
                      {walkTimes[period] && <Check className="h-3 w-3 mr-1" />}
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="walkingInstruction">Walking Instructions</Label>
                <Textarea
                  id="walkingInstruction"
                  placeholder="Walk around the block for 15-20 minutes"
                  value={walkingInstruction}
                  onChange={(e) => setWalkingInstruction(e.target.value)}
                  className="rounded-2xl"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Let Out Instructions */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                <Home className="h-5 w-5 text-orange-500" />
                Let Out Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Let Out Times</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={letoutTimes[period] ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLetoutTimes(prev => ({ ...prev, [period]: !prev[period] }))}
                      className="rounded-2xl capitalize"
                    >
                      {letoutTimes[period] && <Check className="h-3 w-3 mr-1" />}
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
              

              
              <div>
                <Label htmlFor="letoutInstruction">Instructions</Label>
                <Textarea
                  id="letoutInstruction"
                  placeholder="Let out for 5-10 minutes in the backyard"
                  value={letoutInstruction}
                  onChange={(e) => setLetoutInstruction(e.target.value)}
                  className="rounded-2xl"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="pt-6">
              <Button
                onClick={handleSaveSchedule}
                disabled={isLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? 'Saving...' : 'Save Schedule'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupScreen; 