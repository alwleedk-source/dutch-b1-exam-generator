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
    if (user?.preferred_language) {
      return user.preferred_language as Language;
    }
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return (saved as Language) || "en";
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
    localStorage.setItem(LANGUAGE_KEY, language);
    
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
    localStorage.setItem(LANGUAGE_KEY, lang);
    
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
