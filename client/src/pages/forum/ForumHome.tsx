import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Plus } from "lucide-react";
import { Link } from "wouter";

export default function ForumHome() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const { data: categories, isLoading } = trpc.forum.getCategories.useQuery();
  
  // Filter categories by current language
  const filteredCategories = categories?.filter(cat => cat.language === language) || [];
  
  // Group by category type
  const groupedCategories = {
    exams_tips: filteredCategories.filter(c => c.category_type === "exams_tips"),
    experiences: filteredCategories.filter(c => c.category_type === "experiences"),
    questions: filteredCategories.filter(c => c.category_type === "questions"),
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {t.forumTitle || "Community Forum"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t.forumDescription || "Discuss, share experiences, and ask questions"}
              </p>
            </div>
            
            {user && (
              <Link href="/forum/new-topic" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{t.createNewTopic || "New Topic"}</span>
                  <span className="sm:hidden">{t.newTopic || "New"}</span>
                </Button>
              </Link>
            )}
          </div>
          
          {/* Language selector */}
          <div className="flex flex-wrap gap-2">
            <Link href="/forum?lang=nl">
              <Button variant={language === "nl" ? "default" : "outline"} size="sm" className="text-xs sm:text-sm">
                🇳🇱 <span className="hidden xs:inline">Nederlands</span><span className="xs:hidden">NL</span>
              </Button>
            </Link>
            <Link href="/forum?lang=ar">
              <Button variant={language === "ar" ? "default" : "outline"} size="sm" className="text-xs sm:text-sm">
                🇸🇦 <span className="hidden xs:inline">العربية</span><span className="xs:hidden">AR</span>
              </Button>
            </Link>
            <Link href="/forum?lang=en">
              <Button variant={language === "en" ? "default" : "outline"} size="sm" className="text-xs sm:text-sm">
                🇬🇧 <span className="hidden xs:inline">English</span><span className="xs:hidden">EN</span>
              </Button>
            </Link>
            <Link href="/forum?lang=tr">
              <Button variant={language === "tr" ? "default" : "outline"} size="sm" className="text-xs sm:text-sm">
                🇹🇷 <span className="hidden xs:inline">Türkçe</span><span className="xs:hidden">TR</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 sm:h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedCategories).map(([type, cats]) => (
              <div key={type}>
                {cats.map((category) => (
                  <Link key={category.id} href={`/forum/category/${category.id}`}>
                    <Card className="card-hover cursor-pointer">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="text-2xl sm:text-4xl flex-shrink-0">{category.icon}</span>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-xl break-words">
                              {t[category.name_key as keyof typeof t] || category.name_key}
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-1 break-words">
                              {t[category.description_key as keyof typeof t] || category.description_key}
                            </CardDescription>
                          </div>
                          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {!user && (
          <Card className="mt-6 sm:mt-8 border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <p className="text-center text-sm sm:text-base text-muted-foreground">
                {t.forumLoginPrompt || "Please log in to create topics and participate in discussions"}
              </p>
              <div className="flex justify-center mt-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    {t.login || "Log In"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
