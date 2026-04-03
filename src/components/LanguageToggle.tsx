import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';

declare global {
  interface Window {
    translatePageContent: (lang: string) => void;
    translationCache: Record<string, string>;
    isTranslating: boolean;
  }
}

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    
    // Trigger page translation
    if (window.translatePageContent) {
      window.translatePageContent(newLang);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="relative"
      title={language === 'en' ? 'Switch to Hindi' : 'अंग्रेज़ी में स्विच करें'}
    >
      <Languages className="w-5 h-5" />
      <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded px-1">
        {language.toUpperCase()}
      </span>
    </Button>
  );
};

export default LanguageToggle;

