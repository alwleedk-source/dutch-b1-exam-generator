import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, getTranslations, Translations } from "@shared/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Unified language key - used for both UI and word translations
const LANGUAGE_KEY = "preferredLanguage";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Get initial language from user preference, localStorage, or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      // Priority 1: localStorage (most recent user choice) - try multiple keys
      const saved = localStorage.getItem(LANGUAGE_KEY) || localStorage.getItem("lang");
      if (saved && ["nl", "ar", "en", "tr"].includes(saved)) {
        return saved as Language;
      }
      
      // Priority 2: User preference from database
      if (user?.preferred_language) {
        return user.preferred_language as Language;
      }
      
      // Priority 3: Browser language
      const browserLang = navigator.language.split("-")[0];
      if (["nl", "ar", "en", "tr"].includes(browserLang)) {
        return browserLang as Language;
      }
    } catch (error) {
      console.error("Error reading language preference:", error);
    }
    
    // Default: Dutch (since this is a Dutch learning app)
    return "nl";
  });

  const [t, setT] = useState<Translations>(() => getTranslations(language));

  // Mutation to update language in database
  const updateLanguageMutation = trpc.auth.updateLanguage.useMutation({
    onSuccess: () => {
      // Language updated successfully
    },
    onError: (error) => {
      console.error("Failed to update language:", error);
    },
  });

  // Update translations when language changes
  useEffect(() => {
    setT(getTranslations(language));
    
    // Save to localStorage with multiple keys for reliability
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
      localStorage.setItem("lang", language);
      // Also save with timestamp to detect stale data
      localStorage.setItem("lang_timestamp", Date.now().toString());
    } catch (error) {
      console.error("Failed to persist language:", error);
    }
    
    // Update HTML dir attribute for RTL languages
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // Sync with user preference when user logs in
  useEffect(() => {
    if (user?.preferred_language && user.preferred_language !== language) {
      setLanguageState(user.preferred_language as Language);
    }
  }, [user?.preferred_language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Save to localStorage immediately (multiple times for reliability)
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
      localStorage.setItem("lang", lang);
      localStorage.setItem("lang_timestamp", Date.now().toString());
      
      // Force a storage event
      window.dispatchEvent(new StorageEvent("storage", {
        key: LANGUAGE_KEY,
        newValue: lang,
        url: window.location.href
      }));
      
      // Additional verification - read back to ensure it was saved
      const verified = localStorage.getItem(LANGUAGE_KEY);
      if (verified !== lang) {
        console.warn("Language save verification failed, retrying...");
        localStorage.setItem(LANGUAGE_KEY, lang);
      }
    } catch (error) {
      console.error("Failed to save language to localStorage:", error);
      // Try using sessionStorage as fallback
      try {
        sessionStorage.setItem(LANGUAGE_KEY, lang);
      } catch (e) {
        console.error("SessionStorage fallback also failed:", e);
      }
    }
    
    // Sync with database if user is logged in
    if (user) {
      updateLanguageMutation.mutate({ language: lang });
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
