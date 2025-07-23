
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
  phone_number?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First, try to get the profile directly by user ID
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create one for the authenticated user
        if (error.code === 'PGRST116') {
          console.log('No profile found for user, creating default profile');
          
          // Get user metadata for profile creation
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            const newProfile = {
              id: userId,
              name: authUser.email?.split('@')[0] || 'User',
              short_name: (authUser.email?.split('@')[0] || 'U').substring(0, 2).toUpperCase(),
              session_code: 'DEFAULT',
              is_admin: authUser.email === 'kiran@dingdongdog.com'
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
              return null;
            }
            
            console.log('Profile created successfully:', createdProfile);
            return createdProfile;
          }
        }
        return null;
      } else {
        console.log('Profile fetched successfully:', profileData);
        return profileData;
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session:', session?.user?.id);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    profile,
    isLoading,
    logout
  };
};
