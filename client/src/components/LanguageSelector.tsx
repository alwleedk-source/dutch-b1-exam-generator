import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface LanguageSelectorProps {
  open: boolean;
  onLanguageSelected: (language: string) => void;
}

const languages = [
  {
    code: "ar",
    name: "العربية",
    flag: "🇸🇦",
    nativeName: "Arabic"
  },
  {
    code: "en",
    name: "English",
    flag: "🇬🇧",
    nativeName: "English"
  },
  {
    code: "tr",
    name: "Türkçe",
    flag: "🇹🇷",
    nativeName: "Turkish"
  },
];

export default function LanguageSelector({ open, onLanguageSelected }: LanguageSelectorProps) {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  
  const updateLanguageMutation = trpc.user.updatePreferredLanguage.useMutation({
    onSuccess: () => {
      if (selectedLanguage) {
        // Save to localStorage as well
        localStorage.setItem('preferredLanguage', selectedLanguage);
        onLanguageSelected(selectedLanguage);
      }
    },
  });
  
  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    
    if (user) {
      // Save to database for logged-in users
      updateLanguageMutation.mutate({ language: code });
    } else {
      // Save to localStorage for non-logged-in users
      localStorage.setItem('preferredLanguage', code);
      onLanguageSelected(code);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            اختر لغتك / Choose your language
          </DialogTitle>
          <DialogDescription className="text-center">
            Select your preferred language for translations
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-3 py-4">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={selectedLanguage === lang.code ? "default" : "outline"}
              size="lg"
              onClick={() => handleLanguageSelect(lang.code)}
              className="h-16 text-lg justify-start gap-4 hover:scale-[1.02] transition-transform"
              disabled={updateLanguageMutation.isPending}
            >
              <span className="text-3xl">{lang.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{lang.name}</span>
                <span className="text-xs opacity-70">{lang.nativeName}</span>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>You can change this later from the settings</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
