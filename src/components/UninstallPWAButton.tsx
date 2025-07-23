
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UninstallPWAButton = () => {
  const [isUninstalling, setIsUninstalling] = useState(false);
  const { toast } = useToast();

  const handleUninstall = async () => {
    setIsUninstalling(true);
    
    try {
      // Check if the app is installed as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isWebApp = (window.navigator as any).standalone === true;
      
      if (isStandalone || isWebApp) {
        toast({
          title: "Uninstall Instructions",
          description: "To uninstall: Open Chrome menu → More Tools → Remove from Chrome, or long-press the app icon on your home screen.",
          duration: 8000
        });
      } else {
        // Clear all app data for browser version
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
        
        // Clear cache storage
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        
        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();
        
        toast({
          title: "App Data Cleared",
          description: "All app data has been cleared. Refresh the page to start fresh.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error during uninstall:', error);
      toast({
        title: "Uninstall Help",
        description: "To remove the app: Chrome menu → More Tools → Remove from Chrome, or remove from your device's app drawer.",
        duration: 8000
      });
    } finally {
      setIsUninstalling(false);
    }
  };

  return (
    <Button
      onClick={handleUninstall}
      disabled={isUninstalling}
      variant="outline"
      size="sm"
      className="rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isUninstalling ? 'Clearing...' : 'Uninstall App'}
    </Button>
  );
};

export default UninstallPWAButton;
