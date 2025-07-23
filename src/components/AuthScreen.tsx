
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login for:', email);
      
      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Login Failed",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        console.log('Auth successful, user ID:', authData.user.id);
        
        // The useAuth hook will handle fetching the profile
        // Just show success message
        toast({
          title: "Login Successful",
          description: "Welcome back!",
          variant: "default"
        });
      }
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
          <p className="text-gray-500 mt-2">Login to your account</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-2 focus:border-purple-300 transition-all duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border-2 focus:border-purple-300 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-12 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:scale-105 transition-all duration-300"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Admin: kiran@dingdongdog.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
