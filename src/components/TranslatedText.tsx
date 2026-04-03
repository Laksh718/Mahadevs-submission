import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatedTextProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const TranslatedText = ({ children, as: Component = 'span', className }: TranslatedTextProps) => {
  const { language, translateDynamic } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const translate = async () => {
      if (language === 'en') {
        setTranslatedText(children);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateDynamic(children);
        if (isMounted) {
          setTranslatedText(translated);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(children);
        }
      } finally {
        if (isMounted) {
          setIsTranslating(false);
        }
      }
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [children, language, translateDynamic]);

  return <Component className={className}>{translatedText}</Component>;
};

// Hook for programmatic translation
export const useTranslate = () => {
  const { translateDynamic, language } = useLanguage();

  const translate = async (text: string): Promise<string> => {
    if (language === 'en' || !text) return text;
    return await translateDynamic(text);
  };

  return { translate, language };
};
