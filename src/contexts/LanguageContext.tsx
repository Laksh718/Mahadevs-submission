import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translateWithCache } from '@/lib/translate';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  translateDynamic: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.dashboard': 'Dashboard',
    'header.myReports': 'My Reports',
    'header.community': 'Community',
    'header.floodPrediction': 'Flood Prediction',
    'header.analytics': 'Analytics',
    'header.findShelters': 'Find Shelters',
    'header.emergencyContacts': 'Emergency Contacts',
    'header.viewAlerts': 'View Alerts',
    'header.profileSettings': 'Profile Settings',
    'header.signOut': 'Sign Out',
    'header.updateLocation': 'Update Location',
    'header.refresh': 'Refresh',
    'header.locationUnavailable': 'Location unavailable',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcomeBack': 'Welcome back',
    'dashboard.overview': 'Overview',
    'dashboard.nearbyShelters': 'Nearby Shelters',
    'dashboard.totalReports': 'Total Reports',
    'dashboard.allYourFloodReports': 'All your flood reports',
    'dashboard.criticalReports': 'Critical Reports',
    'dashboard.highPriorityReports': 'High priority reports',
    'dashboard.verifiedReports': 'Verified Reports',
    'dashboard.confirmedByAuthorities': 'Confirmed by authorities',
    'dashboard.pendingReports': 'Pending Reports',
    'dashboard.awaitingVerification': 'Awaiting verification',
    
    // Quick Actions
    'quickActions.title': 'Quick Actions',
    'quickActions.description': 'Common tasks and emergency actions',
    'quickActions.newReport': 'New Report',
    'quickActions.findShelters': 'Find Shelters',
    'quickActions.emergencyContacts': 'Emergency Contacts',
    'quickActions.viewAlerts': 'View Alerts',
    
    // Community Safety Score
    'safety.title': 'Community Safety Score',
    'safety.citizenFeature': 'Citizen Feature',
    'safety.description': 'Real-time safety assessment for your area based on reports and alerts',
    'safety.safetyScore': 'Safety Score',
    'safety.good': 'Good',
    'safety.nearbyReports': 'Nearby Reports',
    'safety.last24h': 'Last 24h',
    'safety.activeShelters': 'Active Shelters',
    'safety.available': 'Available',
    'safety.trends': 'Safety Trends',
    'safety.floodRisk': 'Flood Risk',
    'safety.low': 'Low',
    'safety.medium': 'Medium',
    'safety.high': 'High',
    'safety.emergencyResponse': 'Emergency Response',
    'safety.communityAlert': 'Community Alert',
    
    // Reports
    'reports.title': 'My Flood Reports',
    'reports.description': 'View and manage your personal flood reports. Track the status of your submissions and access detailed information.',
    'reports.yourLocation': 'Your location',
    'reports.submitNew': 'Submit New Report',
    'reports.myReports': 'My Reports',
    'reports.critical': 'Critical',
    'reports.verified': 'Verified',
    'reports.pending': 'Pending',
    'reports.view': 'View',
    'reports.delete': 'Delete',
    'reports.loading': 'Loading reports...',
    'reports.noReports': "You haven't submitted any reports yet. Create your first report!",
    
    // Volunteer Navigation
    'volunteer.myActivities': 'My Activities',
    'volunteer.training': 'Training',
    'volunteer.reports': 'Reports',
    'volunteer.communityVolunteer': 'Community Volunteer',
    
    // NGO Navigation
    'ngo.activeAlerts': 'Active Alerts',
    'ngo.userManagement': 'User Management',
    'ngo.trainingPrograms': 'Training Programs',
    'ngo.ngoCoordinator': 'NGO Coordinator',
    
    // DMA Navigation
    'dma.mapView': 'Map View',
    'dma.alertManagement': 'Alert Management',
    'dma.resources': 'Resources',
    'dma.reportManagement': 'Report Management',
    'dma.dmaOfficer': 'DMA Officer',
    
    // Common
    'common.citizen': 'CITIZEN',
    'common.volunteer': 'VOLUNTEER',
    'common.ngo': 'NGO',
    'common.dma': 'DMA',
    'common.communityMember': 'Community Member',
    'common.loading': 'Loading...',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
  },
  hi: {
    // Header
    'header.dashboard': 'डैशबोर्ड',
    'header.myReports': 'मेरी रिपोर्टें',
    'header.community': 'समुदाय',
    'header.floodPrediction': 'बाढ़ पूर्वानुमान',
    'header.analytics': 'विश्लेषण',
    'header.findShelters': 'आश्रय खोजें',
    'header.emergencyContacts': 'आपातकालीन संपर्क',
    'header.viewAlerts': 'अलर्ट देखें',
    'header.profileSettings': 'प्रोफ़ाइल सेटिंग्स',
    'header.signOut': 'साइन आउट',
    'header.updateLocation': 'स्थान अपडेट करें',
    'header.refresh': 'ताज़ा करें',
    'header.locationUnavailable': 'स्थान अनुपलब्ध',
    
    // Dashboard
    'dashboard.title': 'डैशबोर्ड',
    'dashboard.welcomeBack': 'वापसी पर स्वागत है',
    'dashboard.overview': 'अवलोकन',
    'dashboard.nearbyShelters': 'निकटतम आश्रय',
    'dashboard.totalReports': 'कुल रिपोर्टें',
    'dashboard.allYourFloodReports': 'आपकी सभी बाढ़ रिपोर्टें',
    'dashboard.criticalReports': 'गंभीर रिपोर्टें',
    'dashboard.highPriorityReports': 'उच्च प्राथमिकता रिपोर्टें',
    'dashboard.verifiedReports': 'सत्यापित रिपोर्टें',
    'dashboard.confirmedByAuthorities': 'अधिकारियों द्वारा पुष्टि की गई',
    'dashboard.pendingReports': 'लंबित रिपोर्टें',
    'dashboard.awaitingVerification': 'सत्यापन की प्रतीक्षा में',
    
    // Quick Actions
    'quickActions.title': 'त्वरित कार्य',
    'quickActions.description': 'सामान्य कार्य और आपातकालीन क्रियाएं',
    'quickActions.newReport': 'नई रिपोर्ट',
    'quickActions.findShelters': 'आश्रय खोजें',
    'quickActions.emergencyContacts': 'आपातकालीन संपर्क',
    'quickActions.viewAlerts': 'अलर्ट देखें',
    
    // Community Safety Score
    'safety.title': 'सामुदायिक सुरक्षा स्कोर',
    'safety.citizenFeature': 'नागरिक सुविधा',
    'safety.description': 'रिपोर्ट और अलर्ट के आधार पर आपके क्षेत्र के लिए वास्तविक समय सुरक्षा मूल्यांकन',
    'safety.safetyScore': 'सुरक्षा स्कोर',
    'safety.good': 'अच्छा',
    'safety.nearbyReports': 'निकटतम रिपोर्टें',
    'safety.last24h': 'पिछले 24 घंटे',
    'safety.activeShelters': 'सक्रिय आश्रय',
    'safety.available': 'उपलब्ध',
    'safety.trends': 'सुरक्षा रुझान',
    'safety.floodRisk': 'बाढ़ जोखिम',
    'safety.low': 'कम',
    'safety.medium': 'मध्यम',
    'safety.high': 'उच्च',
    'safety.emergencyResponse': 'आपातकालीन प्रतिक्रिया',
    'safety.communityAlert': 'सामुदायिक अलर्ट',
    
    // Reports
    'reports.title': 'मेरी बाढ़ रिपोर्टें',
    'reports.description': 'अपनी व्यक्तिगत बाढ़ रिपोर्ट देखें और प्रबंधित करें। अपने सबमिशन की स्थिति ट्रैक करें और विस्तृत जानकारी एक्सेस करें।',
    'reports.yourLocation': 'आपका स्थान',
    'reports.submitNew': 'नई रिपोर्ट सबमिट करें',
    'reports.myReports': 'मेरी रिपोर्टें',
    'reports.critical': 'गंभीर',
    'reports.verified': 'सत्यापित',
    'reports.pending': 'लंबित',
    'reports.view': 'देखें',
    'reports.delete': 'हटाएं',
    'reports.loading': 'रिपोर्ट लोड हो रही हैं...',
    'reports.noReports': 'आपने अभी तक कोई रिपोर्ट सबमिट नहीं की है। अपनी पहली रिपोर्ट बनाएं!',
    
    // Volunteer Navigation
    'volunteer.myActivities': 'मेरी गतिविधियाँ',
    'volunteer.training': 'प्रशिक्षण',
    'volunteer.reports': 'रिपोर्टें',
    'volunteer.communityVolunteer': 'सामुदायिक स्वयंसेवक',
    
    // NGO Navigation
    'ngo.activeAlerts': 'सक्रिय अलर्ट',
    'ngo.userManagement': 'उपयोगकर्ता प्रबंधन',
    'ngo.trainingPrograms': 'प्रशिक्षण कार्यक्रम',
    'ngo.ngoCoordinator': 'एनजीओ समन्वयक',
    
    // DMA Navigation
    'dma.mapView': 'मानचित्र दृश्य',
    'dma.alertManagement': 'अलर्ट प्रबंधन',
    'dma.resources': 'संसाधन',
    'dma.reportManagement': 'रिपोर्ट प्रबंधन',
    'dma.dmaOfficer': 'डीएमए अधिकारी',
    
    // Common
    'common.citizen': 'नागरिक',
    'common.volunteer': 'स्वयंसेवक',
    'common.ngo': 'एनजीओ',
    'common.dma': 'डीएमए',
    'common.communityMember': 'समुदाय सदस्य',
    'common.loading': 'लोड हो रहा है...',
    'common.close': 'बंद करें',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.submit': 'सबमिट करें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'hi' ? 'hi' : 'en') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const translateDynamic = async (text: string): Promise<string> => {
    if (language === 'en' || !text) return text;
    return await translateWithCache(text, language);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
