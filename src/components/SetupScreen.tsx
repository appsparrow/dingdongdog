
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, X, LogOut, Clock, Utensils, Home, Check, Save, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import UninstallPWAButton from './UninstallPWAButton';
import NotificationSettings from './NotificationSettings';

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
  pet_name?: string;
  pet_image_url?: string;
}

interface SetupScreenProps {
  profile: Profile;
  onClose: () => void;
  onLogout: () => void;
}

const SetupScreen = ({ profile, onClose, onLogout }: SetupScreenProps) => {
  const [newCaretakerName, setNewCaretakerName] = useState('');
  const [newCaretakerShortName, setNewCaretakerShortName] = useState('');
  const [newCaretakerPhone, setNewCaretakerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();
  const { logout } = useAuth();

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

  // Passcode editing
  const [editingPasscode, setEditingPasscode] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [showAddCaretaker, setShowAddCaretaker] = useState(false);
  const [editingAdminCode, setEditingAdminCode] = useState(false);
  const [newAdminCode, setNewAdminCode] = useState('');

  // Pet management
  const [petName, setPetName] = useState('');
  const [petImage, setPetImage] = useState<File | null>(null);
  const [petImageUrl, setPetImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Default pet image for Zach
  const defaultPetImageUrl = '/profile-zach.png';

  // Fetch profiles and schedule for this session
  const fetchData = async () => {
    try {
      // Only fetch profiles if user is admin
      if (profile.is_admin) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .eq('session_code', profile.session_code);
        
        setProfiles(profilesData || []);
      }

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
        // @ts-ignore - pet_name and pet_image_url might not be in the type yet
        setPetName(schedule?.pet_name || '');
        // @ts-ignore - pet_name and pet_image_url might not be in the type yet
        setPetImageUrl(schedule?.pet_image_url || defaultPetImageUrl);
        
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

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [profile.session_code]);

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
            letout_count: letoutCount,
            pet_name: petName,
            pet_image_url: petImageUrl,
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
            letout_count: letoutCount,
            pet_name: petName,
            pet_image_url: petImageUrl,
          })
          .eq('id', scheduleId);

        if (scheduleError) throw scheduleError;
      }

      // Clear existing schedule times
      await supabase
        .from('schedule_times')
        .delete()
        .eq('schedule_id', scheduleId);

      // Insert new schedule times
      const scheduleTimesToInsert = [];
      
      // Add feed times
      Object.entries(feedTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: scheduleId,
            activity_type: 'feed',
            time_period: period,
            time_of_day: period
          });
        }
      });

      // Add walk times
      Object.entries(walkTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: scheduleId,
            activity_type: 'walk',
            time_period: period,
            time_of_day: period
          });
        }
      });

      // Add letout times
      Object.entries(letoutTimes).forEach(([period, enabled]) => {
        if (enabled) {
          scheduleTimesToInsert.push({
            schedule_id: scheduleId,
            activity_type: 'letout',
            time_period: period,
            time_of_day: period
          });
        }
      });

      if (scheduleTimesToInsert.length > 0) {
        const { error: timesError } = await supabase
          .from('schedule_times')
          .insert(scheduleTimesToInsert);

        if (timesError) throw timesError;
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

  const handleUpdatePasscode = async () => {
    if (!newPasscode.trim()) {
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
        .update({ phone_number: newPasscode.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Passcode Updated",
        description: "Your passcode has been updated successfully!",
        variant: "default"
      });

      setNewPasscode('');
      setEditingPasscode(false);
      fetchData();
    } catch (error) {
      console.error('Error updating passcode:', error);
      toast({
        title: "Error",
        description: "Failed to update passcode. Please try again.",
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
        description: "Your admin code has been updated successfully!",
        variant: "default"
      });

      setNewAdminCode('');
      setEditingAdminCode(false);
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

  const handleLogout = async () => {
    onLogout();
  };

  const handlePetImageUpload = async (file: File) => {
    console.log('Starting image upload for file:', file.name);
    setIsUploadingImage(true);
    try {
      // First, check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('Auth check for upload:', { session: !!session, error: authError });
      
      if (!session) {
        console.log('No session found, trying to get current user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User check:', { user: !!user, error: userError });
      }

      // First, check if the storage bucket exists
      console.log('Checking storage bucket...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('Error checking buckets:', bucketError);
        throw new Error(`Storage bucket error: ${bucketError.message}`);
      }
      
      console.log('Available buckets:', buckets);
      console.log('Bucket names:', buckets?.map(b => b.name));
      console.log('Looking for bucket with name:', 'pet-images');
      
      const petImagesBucket = buckets?.find(bucket => bucket.name === 'pet-images');
      
      if (!petImagesBucket) {
        console.error('pet-images bucket not found');
        console.log('All available bucket names:', buckets?.map(b => b.name));
        console.log('Bucket search result:', petImagesBucket);
        
        // Try to upload directly to the bucket even if it's not visible
        console.log('Attempting direct upload to pet-images bucket...');
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.session_code}-pet-${Date.now()}.${fileExt}`;
        const filePath = `pet-images/${fileName}`;
        
        console.log('Direct upload path:', filePath);
        
        const { error: directUploadError } = await supabase.storage
          .from('pet-images')
          .upload(filePath, file);
          
        if (directUploadError) {
          console.error('Direct upload failed:', directUploadError);
          throw new Error(`Storage bucket "pet-images" does not exist or is not accessible: ${directUploadError.message}`);
        }
        
        console.log('Direct upload successful, getting public URL...');
        const { data: { publicUrl } } = supabase.storage
          .from('pet-images')
          .getPublicUrl(filePath);
          
        console.log('Public URL:', publicUrl);
        setPetImageUrl(publicUrl);
        setPetImage(null);
        
        toast({
          title: "Image Uploaded",
          description: "Pet image has been uploaded successfully!",
          variant: "default"
        });
        return; // Exit early since we handled the upload
      } else {
        console.log('pet-images bucket found:', petImagesBucket);
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.session_code}-pet-${Date.now()}.${fileExt}`;
      const filePath = `pet-images/${fileName}`;
      
      console.log('Upload path:', filePath);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL...');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      setPetImageUrl(publicUrl);
      setPetImage(null);

      toast({
        title: "Image Uploaded",
        description: "Pet image has been uploaded successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Upload Failed",
        description: `Failed to upload image: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePetImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size);
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      console.log('File validation passed, starting upload...');
      setPetImage(file);
      handlePetImageUpload(file);
    } else {
      console.log('No file selected');
    }
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
                  Settings
                </CardTitle>
                <Button onClick={onClose} variant="ghost" size="sm" className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Pet Management */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <span className="text-2xl">🐕</span>
                Pet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pet Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Pet Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center border-2 border-dashed border-purple-300 overflow-hidden">
                    <img 
                      src={petImageUrl || defaultPetImageUrl} 
                      alt="Pet" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-emoji');
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center text-2xl fallback-emoji" style={{ display: 'none' }}>
                      🐕
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePetImageChange}
                      className="hidden"
                      id="pet-image-upload"
                      disabled={isUploadingImage}
                    />
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                      disabled={isUploadingImage}
                      onClick={() => {
                        console.log('Upload button clicked');
                        const fileInput = document.getElementById('pet-image-upload') as HTMLInputElement;
                        if (fileInput) {
                          console.log('File input found, triggering click');
                          fileInput.click();
                        } else {
                          console.error('File input not found');
                        }
                      }}
                    >
                      {isUploadingImage ? 'Uploading...' : petImageUrl ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 5MB • JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Pet Name */}
              <div className="space-y-2">
                <Label htmlFor="petName" className="text-sm font-medium text-gray-700">Pet Name</Label>
                <Input
                  id="petName"
                  placeholder="Enter your pet's name (e.g., Zach)"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="rounded-2xl"
                />
              </div>

              {/* Debug Storage Access */}
              <div className="space-y-2">
                <Button
                  onClick={async () => {
                    console.log('Testing storage access...');
                    try {
                      // First check authentication
                      const { data: { session }, error: authError } = await supabase.auth.getSession();
                      console.log('Auth check:', { session: !!session, error: authError });
                      
                      const { data: buckets, error } = await supabase.storage.listBuckets();
                      console.log('Storage test result:', { buckets, error });
                      
                      // Also try to list files in pet-images bucket if it exists
                      if (buckets && buckets.length > 0) {
                        const petImagesBucket = buckets.find(b => b.name === 'pet-images');
                        if (petImagesBucket) {
                          const { data: files, error: filesError } = await supabase.storage
                            .from('pet-images')
                            .list();
                          console.log('Pet images files:', { files, error: filesError });
                        }
                      }
                      
                      toast({
                        title: "Storage Test",
                        description: error ? `Error: ${error.message}` : `Found ${buckets?.length || 0} buckets`,
                        variant: error ? "destructive" : "default"
                      });
                    } catch (err) {
                      console.error('Storage test failed:', err);
                      toast({
                        title: "Storage Test Failed",
                        description: String(err),
                        variant: "destructive"
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-2xl"
                >
                  Test Storage Access
                </Button>
                
                <Button
                  onClick={() => {
                    console.log('Testing file input...');
                    const fileInput = document.getElementById('pet-image-upload') as HTMLInputElement;
                    if (fileInput) {
                      console.log('File input found:', fileInput);
                      console.log('File input properties:', {
                        type: fileInput.type,
                        accept: fileInput.accept,
                        disabled: fileInput.disabled,
                        id: fileInput.id
                      });
                      fileInput.click();
                    } else {
                      console.error('File input not found');
                      toast({
                        title: "File Input Error",
                        description: "File input element not found",
                        variant: "destructive"
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-2xl"
                >
                  Test File Input
                </Button>
                
                <Button
                  onClick={async () => {
                    toast({
                      title: "Bucket Creation",
                      description: "Please run the SQL commands in Supabase dashboard. Client-side bucket creation is blocked by RLS policies.",
                      variant: "default"
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full rounded-2xl"
                >
                  Create Storage Bucket
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Management - Admin Only */}
          {profile.is_admin && (
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Schedule Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Feeding Schedule */}
                <div className="space-y-4">
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
                </div>

                {/* Walking Schedule */}
                <div className="space-y-4">
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
                </div>

                {/* Let Out Schedule */}
                <div className="space-y-4">
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
                    <Label htmlFor="letoutInstruction">Let Out Instructions</Label>
                    <Textarea
                      id="letoutInstruction"
                      placeholder="Let out for 5-10 minutes in the backyard"
                      value={letoutInstruction}
                      onChange={(e) => setLetoutInstruction(e.target.value)}
                      className="rounded-2xl"
                      rows={2}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSchedule}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Schedule'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Caretaker (Admin Only) */}
          {profile.is_admin && (
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
                        <Badge variant="default">Owner</Badge>
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Session Info - Admin Only */}
          {profile.is_admin && (
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
                    {profile.is_admin ? "Owner" : "Caretaker"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          <NotificationSettings profile={profile} />

          {/* Admin Code and User Code Management (Admin Only) */}
          {profile.is_admin && (
            <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Code Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Admin Code */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Admin Code</Label>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <span className="text-gray-600">Current Admin Code:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {profile.session_code}
                    </Badge>
                  </div>
                  {editingAdminCode ? (
                    <div className="flex gap-2">
                      <Input
                        value={newAdminCode}
                        onChange={(e) => setNewAdminCode(e.target.value)}
                        placeholder="Enter new admin code"
                        maxLength={4}
                        className="rounded-2xl flex-1"
                      />
                      <Button
                        onClick={handleUpdateAdminCode}
                        disabled={isLoading || !newAdminCode.trim()}
                        className="rounded-2xl bg-purple-500 hover:bg-purple-600"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingAdminCode(false);
                          setNewAdminCode('');
                        }}
                        variant="outline"
                        className="rounded-2xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setEditingAdminCode(true)}
                      variant="outline"
                      className="w-full rounded-2xl"
                    >
                      Change Admin Code
                    </Button>
                  )}
                </div>

                {/* User Code (Passcode) */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Label className="text-sm font-medium text-gray-700">User Code (Your Passcode)</Label>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                    <span className="text-gray-600">Current User Code:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {profile.phone_number || 'Not set'}
                    </Badge>
                  </div>
                  {editingPasscode ? (
                    <div className="flex gap-2">
                      <Input
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="Enter new user code"
                        maxLength={4}
                        className="rounded-2xl flex-1"
                      />
                      <Button
                        onClick={handleUpdatePasscode}
                        disabled={isLoading || !newPasscode.trim()}
                        className="rounded-2xl bg-blue-500 hover:bg-blue-600"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingPasscode(false);
                          setNewPasscode('');
                        }}
                        variant="outline"
                        className="rounded-2xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setEditingPasscode(true)}
                      variant="outline"
                      className="w-full rounded-2xl"
                    >
                      Change User Code
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
    </div>
  );
};

export default SetupScreen;
