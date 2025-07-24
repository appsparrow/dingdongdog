
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { usePWA } from '@/hooks/usePWA';
import SimpleAuthScreen from '@/components/SimpleAuthScreen';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import Index from '@/pages/Index';
import './App.css';

interface Profile {
  id: string;
  name: string;
  short_name: string;
  session_code: string;
  is_admin: boolean;
}

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize PWA functionality
  usePWA();

  const handleLogout = () => {
    setProfile(null);
  };

  useEffect(() => {
    // Add manifest link to head
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);

    // Add theme color meta tag
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#8b5cf6';
    document.head.appendChild(themeColor);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(themeColor)) document.head.removeChild(themeColor);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show auth screen if no profile
  if (!profile) {
    return (
      <>
        <SimpleAuthScreen onLogin={setProfile} />
        <PWAInstallPrompt />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Index 
        profile={profile} 
        onShowSetup={() => {}} 
        onLogout={handleLogout}
      />
      <PWAInstallPrompt />
      <Toaster />
    </>
  );
}

export default App;
