
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dog } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
}

interface AuthScreenProps {
  onLogin: (profile: Profile) => void;
}

const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!name.trim() || !code.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and session code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Find profile by name and session code
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', name.trim())
        .eq('session_code', code.trim())
        .single();

      if (error || !profiles) {
        toast({
          title: "Login Failed",
          description: "No matching caretaker found. Please check your name and session code.",
          variant: "destructive"
        });
        return;
      }

      // Sign in with Supabase Auth using the profile ID
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: `${profiles.id}@dingdongdog.local`,
        password: profiles.session_code
      });

      if (authError) {
        // If auth fails, create the auth user
        const { error: signUpError } = await supabase.auth.signUp({
          email: `${profiles.id}@dingdongdog.local`,
          password: profiles.session_code,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: profiles.name,
              short_name: profiles.short_name,
              session_code: profiles.session_code,
              is_admin: profiles.is_admin
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }
      }

      onLogin(profiles);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg">
              <Dog className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            DingDongDog
          </CardTitle>
          <p className="text-gray-500 mt-2">Enter your caretaker details</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border-2 focus:border-purple-300 transition-all duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-gray-700">
              Session Code
            </Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 4-digit session code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-2xl border-2 focus:border-purple-300 transition-all duration-200"
              maxLength={4}
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-12 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:scale-105 transition-all duration-300"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
