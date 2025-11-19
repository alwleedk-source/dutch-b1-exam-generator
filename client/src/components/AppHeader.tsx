import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen } from "lucide-react";
import { Link } from "wouter";

/**
 * Shared application header with navigation
 * Used across all authenticated pages
 */
export function AppHeader() {
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="border-b border-border/50 glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">Dutch B1</h1>
            </div>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Link href="/create-exam">
              <Button variant="ghost" size="sm">{t.createNewExam || "Create Exam"}</Button>
            </Link>
            <Link href="/my-exams">
              <Button variant="ghost" size="sm">{t.myExams}</Button>
            </Link>
            <Link href="/public-exams">
              <Button variant="ghost" size="sm">{t.publicExams}</Button>
            </Link>
            <Link href="/progress">
              <Button variant="ghost" size="sm">{t.progress || "Progress"}</Button>
            </Link>
            <Link href="/vocabulary">
              <Button variant="ghost" size="sm">{t.vocabulary || "Vocabulary"}</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              {t.logout || "Logout"}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
