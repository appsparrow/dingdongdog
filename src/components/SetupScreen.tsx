
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, X, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import UninstallPWAButton from './UninstallPWAButton';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
  phone_number?: string;
}

interface SetupScreenProps {
  profile: Profile;
  onClose: () => void;
}

const SetupScreen = ({ profile, onClose }: SetupScreenProps) => {
  const [newCaretakerName, setNewCaretakerName] = useState('');
  const [newCaretakerShortName, setNewCaretakerShortName] = useState('');
  const [newCaretakerPhone, setNewCaretakerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();
  const { logout } = useAuth();

  // Fetch profiles for this session
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_code', profile.session_code);
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  // Load profiles on mount
  useState(() => {
    fetchProfiles();
  });

  const handleAddCaretaker = async () => {
    if (!newCaretakerName.trim() || !newCaretakerShortName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and short name",
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
          phone_number: newCaretakerPhone.trim() || null,
          session_code: profile.session_code,
          is_admin: false
        });

      if (error) throw error;

      toast({
        title: "Caretaker Added",
        description: `${newCaretakerName} has been added successfully!`,
        variant: "default"
      });

      // Clear form
      setNewCaretakerName('');
      setNewCaretakerShortName('');
      setNewCaretakerPhone('');
      
      // Refresh profiles
      fetchProfiles();
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

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <Settings className="h-6 w-6 text-purple-500" />
                Settings
              </CardTitle>
              <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Current Session Info */}
        <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Session Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Session Code:</span>
              <Badge variant="outline" className="text-lg font-bold">
                {profile.session_code}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Your Role:</span>
              <Badge variant={profile.is_admin ? "default" : "secondary"}>
                {profile.is_admin ? "Admin" : "Caretaker"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Add Caretaker (Admin Only) */}
        {profile.is_admin && (
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                <Users className="h-5 w-5 text-green-500" />
                Add Caretaker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newCaretakerName}
                  onChange={(e) => setNewCaretakerName(e.target.value)}
                  className="rounded-2xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name (2 letters)</Label>
                <Input
                  id="shortName"
                  placeholder="e.g., JD"
                  maxLength={2}
                  value={newCaretakerShortName}
                  onChange={(e) => setNewCaretakerShortName(e.target.value.toUpperCase())}
                  className="rounded-2xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
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
                {isLoading ? 'Adding...' : 'Add Caretaker'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Caretakers */}
        <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Current Caretakers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <p className="text-gray-500 text-center">Loading caretakers...</p>
            ) : (
              <div className="space-y-3">
                {profiles.map((caretaker) => (
                  <div key={caretaker.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {caretaker.short_name}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{caretaker.name}</p>
                        {caretaker.phone_number && (
                          <p className="text-sm text-gray-500">{caretaker.phone_number}</p>
                        )}
                      </div>
                    </div>
                    {caretaker.is_admin && (
                      <Badge variant="default">Admin</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Actions */}
        <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="pt-6 space-y-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-2xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            
            <UninstallPWAButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupScreen;
