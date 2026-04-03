import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { diagnoseRLSIssues } from "./lib/adminSupabase.ts";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import { LanguageProvider } from "./contexts/LanguageContext.tsx";

// Health check function to ping the API on app load/refresh
const performHealthCheck = async () => {
  try {
    const response = await fetch(
      "https://janrakshak-pre-alert-model.onrender.com/health"
    );
    const data = await response.json();
    console.log("JanRakshak API Health Check:", data);
    console.log("API Status:", data.status);
    console.log("Timestamp:", data.timestamp);
  } catch (error) {
    console.error("JanRakshak API Health Check Failed:", error);
  }
};

// Perform health check when app loads
performHealthCheck();

// Set up interval to hit the health endpoint every 40 seconds
const healthCheckInterval = setInterval(performHealthCheck, 40000);

// Clean up interval when page is unloaded
window.addEventListener("beforeunload", () => {
  clearInterval(healthCheckInterval);
});

// Add diagnostic function to global scope for debugging
(window as any).diagnoseRLS = diagnoseRLSIssues;

// Initialize global translation system
(window as any).translationCache = {};
(window as any).isTranslating = false;

(window as any).translatePageContent = async function(targetLang: string) {
  if (targetLang === 'en') {
    location.reload();
    return;
  }

  if ((window as any).isTranslating) {
    console.log('Translation already in progress, skipping...');
    return;
  }

  (window as any).isTranslating = true;
  console.log('🌐 Starting translation to', targetLang);
  
  async function translate(text: string): Promise<string> {
    if (!text || !text.trim()) return text;
    
    const cacheKey = targetLang + ':' + text;
    if ((window as any).translationCache[cacheKey]) {
      return (window as any).translationCache[cacheKey];
    }
    
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translated = data[0].map((item: any) => item[0]).join('');
        (window as any).translationCache[cacheKey] = translated;
        return translated;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    return text;
  }

  async function translateElement(element: any): Promise<void> {
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
      return;
    }

    for (let node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text && text.length > 0 && !/^[0-9\s\-\/\.,]+$/.test(text)) {
          const translated = await translate(text);
          if (translated !== text) {
            node.textContent = translated;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.placeholder) {
          node.placeholder = await translate(node.placeholder);
        }
        if (node.title && !node.title.includes('Switch') && !node.title.includes('स्विच')) {
          node.title = await translate(node.title);
        }
        if (node.getAttribute && node.getAttribute('aria-label')) {
          const ariaLabel = node.getAttribute('aria-label');
          node.setAttribute('aria-label', await translate(ariaLabel));
        }
        await translateElement(node);
      }
    }
  }

  const mainContent = document.querySelector('main') || document.body;
  await translateElement(mainContent);
  
  (window as any).isTranslating = false;
  console.log('✅ Translation completed to', targetLang);
};

console.log(`
🔧 JanRakshak Database Diagnostics Available!

If you're experiencing 406 errors or profile loading issues, run:
  diagnoseRLS()

This will check your database setup and provide specific fixes.
`);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
