// Simple client-side translation using Google Translate's unofficial API
// For production, consider using official Google Cloud Translation API

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en' || !text) return text;
  
  try {
    // Use Google Translate's unofficial endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Extract translated text from response
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0].map((item: any) => item[0]).join('');
    }
    
    return text; // Return original if translation fails
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

// Batch translate multiple texts
export async function translateBatch(texts: string[], targetLang: string): Promise<Record<string, string>> {
  if (targetLang === 'en') {
    return texts.reduce((acc, text) => ({ ...acc, [text]: text }), {});
  }

  const translations: Record<string, string> = {};
  
  // Translate in parallel
  await Promise.all(
    texts.map(async (text) => {
      translations[text] = await translateText(text, targetLang);
    })
  );

  return translations;
}

// Cache translations in sessionStorage to avoid repeated API calls
const CACHE_KEY = 'translation_cache';

export function getCachedTranslation(text: string, lang: string): string | null {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
    return cache[`${lang}:${text}`] || null;
  } catch {
    return null;
  }
}

export function setCachedTranslation(text: string, lang: string, translation: string): void {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
    cache[`${lang}:${text}`] = translation;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Cache error:', error);
  }
}

// Translate with caching
export async function translateWithCache(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en' || !text) return text;
  
  // Check cache first
  const cached = getCachedTranslation(text, targetLang);
  if (cached) return cached;
  
  // Translate and cache
  const translated = await translateText(text, targetLang);
  setCachedTranslation(text, targetLang, translated);
  
  return translated;
}
