import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dog, Users } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
}

interface SimpleAuthScreenProps {
  onLogin: (profile: Profile) => void;
}

const SimpleAuthScreen = ({ onLogin }: SimpleAuthScreenProps) => {
  const [sessionCode, setSessionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  const handleSessionCodeSubmit = async () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Missing Code",
        description: "Please enter your code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First try to find admin by session code
      const { data: adminProfiles, error: adminError } = await supabase
        .from('profiles')
        .select('*')
        .eq('session_code', sessionCode.trim())
        .eq('is_admin', true);

      if (adminError) throw adminError;

      if (adminProfiles && adminProfiles.length > 0) {
        // Admin found - take them directly to admin screen
        onLogin(adminProfiles[0]);
        return;
      }

      // If not admin, try to find user by phone number last 4 digits
      const { data: userProfiles, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .like('phone_number', `%${sessionCode.trim()}`);

      if (userError) throw userError;

      if (!userProfiles || userProfiles.length === 0) {
        toast({
          title: "Invalid Code",
          description: "No profile found for this code",
          variant: "destructive"
        });
        return;
      }

      // Show user selection for non-admin users
      setAvailableProfiles(userProfiles);
      setShowUserSelection(true);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (profile: Profile) => {
    toast({
      title: "Login Successful",
      description: `Welcome, ${profile.name}!`,
      variant: "default"
    });
    onLogin(profile);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg">
              <Dog className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
Ding Dong Dog          </CardTitle>
          <p className="text-gray-500 mt-2">Keep your pup happy</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionCode" className="text-sm font-medium text-gray-700">
              Enter Code
            </Label>
            <Input
              id="sessionCode"
              type="text"
              placeholder="Admin: session code | User: last 4 digits of phone"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              className="rounded-2xl border-2 focus:border-purple-300 transition-all duration-200 text-center text-lg font-mono"
              maxLength={10}
              onKeyPress={(e) => e.key === 'Enter' && handleSessionCodeSubmit()}
            />
          </div>

          <Button
            onClick={handleSessionCodeSubmit}
            disabled={isLoading}
            className="w-full h-12 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:scale-105 transition-all duration-300"
          >
            {isLoading ? 'Checking...' : 'Enter Session'}
          </Button>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p> User: Use last 4 digits of phone</p>
            
          </div>
        </CardContent>
      </Card>

      {/* User Selection Modal */}
      {showUserSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <Card className="w-full max-w-md rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Select Your Name
              </CardTitle>
              <p className="text-gray-500">Choose your profile to continue</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableProfiles.map((profile) => (
                <Button
                  key={profile.id}
                  onClick={() => handleUserSelect(profile)}
                  variant="outline"
                  className="w-full h-16 rounded-2xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                      {profile.short_name}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{profile.name}</div>
                      {/* <div className="text-sm text-gray-500">{profile.is_admin ? 'Admin' : 'Caretaker'}</div> */}
                    </div>
                  </div>
                </Button>
              ))}
              
              <Button
                onClick={() => setShowUserSelection(false)}
                variant="ghost"
                className="w-full rounded-2xl text-gray-500 hover:text-gray-700"
              >
                Back to Session Code
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SimpleAuthScreen; 