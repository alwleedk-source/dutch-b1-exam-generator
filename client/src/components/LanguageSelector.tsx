import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    setIsUpdating(true);
    
    // Update language through unified system
    setLanguage(code as any);
    
    // Small delay to show selection before closing
    setTimeout(() => {
      setIsUpdating(false);
      onLanguageSelected(code);
    }, 300);
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
              disabled={isUpdating}
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
