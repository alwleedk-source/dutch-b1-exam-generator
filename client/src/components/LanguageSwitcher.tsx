import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const languages = [
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
];

interface LanguageSwitcherProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

export default function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState(
    currentLanguage || user?.preferred_language || localStorage.getItem('preferredLanguage') || 'en'
  );
  
  const updateLanguageMutation = trpc.user.updatePreferredLanguage.useMutation({
    onSuccess: () => {
      toast.success("Language updated successfully");
    },
    onError: () => {
      toast.error("Failed to update language");
    },
  });
  
  const handleLanguageChange = (code: string) => {
    setSelectedLang(code);
    
    if (user) {
      // Save to database for logged-in users
      updateLanguageMutation.mutate({ language: code as "ar" | "en" | "tr" | "nl" });
    } else {
      // Save to localStorage for non-logged-in users
      localStorage.setItem('preferredLanguage', code);
    }
    
    // Notify parent component
    if (onLanguageChange) {
      onLanguageChange(code);
    }
    
    // Reload page to apply language change
    window.location.reload();
  };
  
  const currentLangData = languages.find(l => l.code === selectedLang) || languages[1];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLangData.flag} {currentLangData.name}</span>
          <span className="sm:hidden">{currentLangData.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`gap-2 ${selectedLang === lang.code ? 'bg-accent' : ''}`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
