import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getAdminAlerts, subscribeToAlerts, AdminAlert } from '@/lib/adminSupabase';
import FlashWarning from '@/components/FlashWarning';
import { toast } from 'sonner';

interface AlertContextType {
  alerts: AdminAlert[];
  flashWarning: AdminAlert | null;
  acknowledgedAlerts: Set<string>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  dismissFlashWarning: () => void;
  acknowledgeFlashWarning: () => void;
  refreshAlerts: () => Promise<void>;
  testFlashWarning: () => void;
  enableAudioContext: () => Promise<void>;
  clearAcknowledgedAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
  isAdminContext?: boolean;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children, isAdminContext = false }) => {
  console.log('AlertProvider initialized with isAdminContext:', isAdminContext);
  const { userProfile } = useAuth();
  
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [flashWarning, setFlashWarning] = useState<AdminAlert | null>(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(() => {
    // Load acknowledged alerts from localStorage
    try {
      const saved = localStorage.getItem('acknowledgedAlerts');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Get user's locality for filtering (only for user context)
  const userLocality = !isAdminContext && userProfile?.location ? 
    `${userProfile.location.district}, ${userProfile.location.state}` : 
    null;

  // Fetch alerts from database
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const realAlerts = await getAdminAlerts();
      
      // Filter alerts for user context, show all for admin context
      const filteredAlerts = isAdminContext ? realAlerts : realAlerts.filter(alert => {
        // For users, only show alerts that are relevant to their location or are global
        if (!userLocality) {
          // If user has no location, show all alerts
          return true;
        }
        
        const alertRegion = alert.region.toLowerCase();
        const userDistrict = userProfile?.location?.district?.toLowerCase() || '';
        const userState = userProfile?.location?.state?.toLowerCase() || '';
        
        return alertRegion.includes(userDistrict) || 
               alertRegion.includes(userState) ||
               alertRegion.includes('regional') ||
               alertRegion.includes('city wide') ||
               alertRegion.includes('all areas') ||
               alertRegion.includes('all users') ||
               alertRegion.includes('all states');
      });
      
      setAlerts(filteredAlerts);
      console.log('Fetched real alerts:', realAlerts);
      console.log('Filtered alerts for context:', filteredAlerts);
      
      // Check for critical flood alerts that should show flash warning (only for user context)
      if (!isAdminContext) {
        const criticalFloodAlerts = realAlerts.filter(alert => {
          const isFloodAlert = alert.type.toLowerCase().includes('flood') || 
                              alert.message.toLowerCase().includes('flood') ||
                              alert.severity === 'critical' ||
                              alert.severity === 'high';
          
          // Show flash warning for all critical/high alerts, or flood alerts regardless of location
          const isRelevantToUser = !userLocality || 
            alert.region.toLowerCase().includes(userProfile?.location?.district?.toLowerCase() || '') ||
            alert.region.toLowerCase().includes(userProfile?.location?.state?.toLowerCase() || '') ||
            alert.region.toLowerCase().includes('regional') ||
            alert.region.toLowerCase().includes('city wide') ||
            alert.region.toLowerCase().includes('all areas') ||
            alert.region.toLowerCase().includes('all users') ||
            alert.severity === 'critical' ||
            alert.severity === 'high';
          
          return isFloodAlert && isRelevantToUser && alert.status === 'active' && !acknowledgedAlerts.has(alert.id);
        });
        
        // Show flash warning for the most recent critical alert
        if (criticalFloodAlerts.length > 0) {
          const mostRecentAlert = criticalFloodAlerts.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          console.log('Setting initial flash warning for alert:', mostRecentAlert);
          setFlashWarning(mostRecentAlert);
        } else {
          console.log('No critical flood alerts found for flash warning');
        }
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setAlerts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAlerts();
  }, [userLocality, userProfile, acknowledgedAlerts]);

  // Periodic refresh as fallback
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const updatedAlerts = await getAdminAlerts();
        setAlerts(updatedAlerts);
      } catch (err) {
        console.error('Error refreshing alerts:', err);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Subscribe to real-time alert updates
  useEffect(() => {
    const subscription = subscribeToAlerts((payload) => {
      console.log('Real-time alert update:', payload);
      
      if (payload.eventType === 'INSERT') {
        const newAlert = payload.new as AdminAlert;
        
        // Check if this is a flood-related alert that should show flash warning (only for user context)
        if (!isAdminContext) {
          const isFloodAlert = newAlert.type.toLowerCase().includes('flood') || 
                              newAlert.message.toLowerCase().includes('flood') ||
                              newAlert.severity === 'critical' ||
                              newAlert.severity === 'high';
          
          // Check if alert is relevant to user's location
          const isRelevantToUser = !userLocality || 
            newAlert.region.toLowerCase().includes(userProfile?.location?.district?.toLowerCase() || '') ||
            newAlert.region.toLowerCase().includes(userProfile?.location?.state?.toLowerCase() || '') ||
            newAlert.region.toLowerCase().includes('regional') ||
            newAlert.region.toLowerCase().includes('city wide') ||
            newAlert.region.toLowerCase().includes('all areas') ||
            newAlert.region.toLowerCase().includes('all users') ||
            newAlert.severity === 'critical' ||
            newAlert.severity === 'high';
          
          // Play sound only if sound is enabled
          if (soundEnabled) {
            const playAlertSound = () => {
              try {
                // Try to use Web Audio API first
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                
                if (audioContext.state === 'suspended') {
                  audioContext.resume().then(() => {
                    playOscillatorSound(audioContext, newAlert.severity);
                  }).catch(() => {
                    // Fallback to HTML5 audio
                    playHTML5Sound(newAlert.severity);
                  });
                } else {
                  playOscillatorSound(audioContext, newAlert.severity);
                }
              } catch (e) {
                console.log('Web Audio API failed, trying HTML5 audio:', e);
                // Fallback to HTML5 audio
                playHTML5Sound(newAlert.severity);
              }
            };
            
            const playOscillatorSound = (audioContext: AudioContext, severity: string) => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              // Long beep sound - 3 seconds duration
              const duration = 3.0;
              const frequency = severity === 'critical' ? 1000 : 800;
              
              oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
              oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + duration);
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + duration * 0.8);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + duration);
            };
            
            const playHTML5Sound = (severity: string) => {
              try {
                // Create a data URL for a simple beep sound
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                const frequency = severity === 'critical' ? 1000 : 800;
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
              } catch (e) {
                console.log('HTML5 audio fallback failed:', e);
              }
            };
            
            playAlertSound();
          }

          // Show flash warning for flood alerts that are relevant to user
          console.log('Real-time alert analysis:', {
            alert: newAlert.type,
            severity: newAlert.severity,
            region: newAlert.region,
            isFloodAlert,
            isRelevantToUser,
            userLocality,
            acknowledged: acknowledgedAlerts.has(newAlert.id)
          });
          
          if (isFloodAlert && isRelevantToUser && !acknowledgedAlerts.has(newAlert.id)) {
            console.log('Showing flash warning for alert:', newAlert);
            setFlashWarning(newAlert);
          } else {
            console.log('Showing toast notification for alert:', newAlert);
            // Show toast notification
            toast.success(`New Alert: ${newAlert.type}`, {
              description: newAlert.message,
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  // Navigate to alerts page
                  window.location.href = '/alerts';
                }
              }
            });
          }
        }

        // Add new alert to the list (with filtering for user context)
        if (isAdminContext) {
          setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
        } else {
          // For users, only add if it's relevant to their location
          const isRelevantToUser = !userLocality || 
            newAlert.region.toLowerCase().includes(userProfile?.location?.district?.toLowerCase() || '') ||
            newAlert.region.toLowerCase().includes(userProfile?.location?.state?.toLowerCase() || '') ||
            newAlert.region.toLowerCase().includes('regional') ||
            newAlert.region.toLowerCase().includes('city wide') ||
            newAlert.region.toLowerCase().includes('all areas') ||
            newAlert.region.toLowerCase().includes('all users') ||
            newAlert.region.toLowerCase().includes('all states');
          
          if (isRelevantToUser) {
            setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
          }
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedAlert = payload.new as AdminAlert;
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === updatedAlert.id ? updatedAlert : alert
          )
        );
      } else if (payload.eventType === 'DELETE') {
        const deletedAlert = payload.old as AdminAlert;
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== deletedAlert.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [soundEnabled, userLocality, userProfile, acknowledgedAlerts]);

  // Flash warning handlers
  const dismissFlashWarning = () => {
    setFlashWarning(null);
  };

  const acknowledgeFlashWarning = () => {
    if (flashWarning) {
      const newAcknowledged = new Set([...acknowledgedAlerts, flashWarning.id]);
      setAcknowledgedAlerts(newAcknowledged);
      
      // Persist to localStorage
      try {
        localStorage.setItem('acknowledgedAlerts', JSON.stringify([...newAcknowledged]));
      } catch (e) {
        console.error('Failed to save acknowledged alerts:', e);
      }
      
      setFlashWarning(null);
      toast.success('Alert acknowledged');
    }
  };

  const refreshAlerts = async () => {
    await fetchAlerts();
  };

  const testFlashWarning = () => {
    console.log('testFlashWarning called, isAdminContext:', isAdminContext);
    
    const testAlert: AdminAlert = {
      id: 'test-alert-' + Date.now(),
      type: 'Flood Warning',
      severity: 'critical',
      message: 'TEST: This is a test critical flood alert to verify the flash warning is working properly.',
      region: 'Test Region',
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      sent_to: ['All Users'],
      created_by: 'test@janrakshak.com'
    };
    
    console.log('Created test alert:', testAlert);
    
    if (isAdminContext) {
      console.log('Admin context: Adding alert to list');
      // For admin context, just add the test alert to the list and show a toast
      setAlerts(prev => {
        const newAlerts = [testAlert, ...prev];
        console.log('Updated alerts:', newAlerts);
        return newAlerts;
      });
      toast.success('Test alert added to the alerts list!', {
        description: 'This test alert has been added to your alerts list for testing purposes.',
        duration: 5000,
      });
    } else {
      console.log('User context: Showing flash warning');
      // For user context, show flash warning
      setFlashWarning(testAlert);
    }
  };

  // Enable audio context on user interaction
  const enableAudioContext = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context enabled');
        toast.success('Audio enabled! You will now hear alert sounds.');
      }
    } catch (e) {
      console.log('Failed to enable audio context:', e);
      toast.error('Failed to enable audio. Please try again.');
    }
  };

  // Clear acknowledged alerts
  const clearAcknowledgedAlerts = () => {
    setAcknowledgedAlerts(new Set());
    try {
      localStorage.removeItem('acknowledgedAlerts');
      toast.success('Acknowledged alerts cleared');
    } catch (e) {
      console.error('Failed to clear acknowledged alerts:', e);
    }
  };

  const contextValue: AlertContextType = {
    alerts,
    flashWarning,
    acknowledgedAlerts,
    soundEnabled,
    setSoundEnabled,
    dismissFlashWarning,
    acknowledgeFlashWarning,
    refreshAlerts,
    testFlashWarning,
    enableAudioContext,
    clearAcknowledgedAlerts,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {/* Global Flash Warning Modal (only for user context) */}
      {!isAdminContext && flashWarning && (
        <FlashWarning
          alert={flashWarning}
          onDismiss={dismissFlashWarning}
          onAcknowledge={acknowledgeFlashWarning}
        />
      )}
    </AlertContext.Provider>
  );
};