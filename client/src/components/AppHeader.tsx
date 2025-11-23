import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Menu, LogOut, FileText, BookMarked, TrendingUp, Library, Plus, MessageSquare, Shield } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "./LanguageSwitcher";
import { NotificationsDropdown } from "./NotificationsDropdown";

/**
 * Shared application header with navigation
 * Used across all authenticated pages
 */
export function AppHeader() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="border-b border-border/50 glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-lg sm:text-2xl font-bold gradient-text">StaatKlaar</h1>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
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
            <Link href="/dictionary">
              <Button variant="ghost" size="sm">{t.dictionary || "Dictionary"}</Button>
            </Link>
            <Link href="/forum">
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                {t.forumTitle || "Forum"}
              </Button>
            </Link>
            {(user?.role === "moderator" || user?.role === "admin") && (
              <Link href="/forum/moderator">
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-1" />
                  {t.moderatorPanel || "Moderator"}
                </Button>
              </Link>
            )}
            <NotificationsDropdown />
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={logout}>
              {t.logout || "Logout"}
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1.5">
            <NotificationsDropdown />
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/create-exam">
                  <DropdownMenuItem>
                    <Plus className="mr-2 h-4 w-4" />
                    {t.createNewExam || "Create Exam"}
                  </DropdownMenuItem>
                </Link>
                <Link href="/my-exams">
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    {t.myExams}
                  </DropdownMenuItem>
                </Link>
                <Link href="/public-exams">
                  <DropdownMenuItem>
                    <BookMarked className="mr-2 h-4 w-4" />
                    {t.publicExams}
                  </DropdownMenuItem>
                </Link>
                <Link href="/progress">
                  <DropdownMenuItem>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t.progress || "Progress"}
                  </DropdownMenuItem>
                </Link>
                <Link href="/vocabulary">
                  <DropdownMenuItem>
                    <Library className="mr-2 h-4 w-4" />
                    {t.vocabulary || "Vocabulary"}
                  </DropdownMenuItem>
                </Link>
                <Link href="/dictionary">
                  <DropdownMenuItem>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t.dictionary || "Dictionary"}
                  </DropdownMenuItem>
                </Link>
                <Link href="/forum">
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t.forumTitle || "Forum"}
                  </DropdownMenuItem>
                </Link>
                {(user?.role === "moderator" || user?.role === "admin") && (
                  <Link href="/forum/moderator">
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      {t.moderatorPanel || "Moderator"}
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.logout || "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
