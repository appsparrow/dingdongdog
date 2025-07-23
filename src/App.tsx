
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import { usePWA } from '@/hooks/usePWA';
import AuthScreen from '@/components/AuthScreen';
import SetupScreen from '@/components/SetupScreen';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import Index from '@/pages/Index';
import './App.css';

function App() {
  const { user, profile, isLoading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  
  // Initialize PWA functionality
  usePWA();

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
      document.head.removeChild(link);
      document.head.removeChild(themeColor);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <>
        <AuthScreen onLogin={() => window.location.reload()} />
        <PWAInstallPrompt />
        <Toaster />
      </>
    );
  }

  if (showSetup) {
    return (
      <>
        <SetupScreen 
          profile={profile} 
          onClose={() => setShowSetup(false)} 
        />
        <PWAInstallPrompt />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Index 
        profile={profile} 
        onShowSetup={() => setShowSetup(true)} 
      />
      <PWAInstallPrompt />
      <Toaster />
    </>
  );
}

export default App;
