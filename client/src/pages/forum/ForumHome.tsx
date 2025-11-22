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
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {t.forumTitle || "Community Forum"}
              </h1>
              <p className="text-muted-foreground">
                {t.forumDescription || "Discuss, share experiences, and ask questions"}
              </p>
            </div>
            
            {user && (
              <Link href="/forum/new-topic">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  {t.createNewTopic || "New Topic"}
                </Button>
              </Link>
            )}
          </div>
          
          {/* Language selector */}
          <div className="flex gap-2">
            <Link href="/forum?lang=nl">
              <Button variant={language === "nl" ? "default" : "outline"} size="sm">
                🇳🇱 Nederlands
              </Button>
            </Link>
            <Link href="/forum?lang=ar">
              <Button variant={language === "ar" ? "default" : "outline"} size="sm">
                🇸🇦 العربية
              </Button>
            </Link>
            <Link href="/forum?lang=en">
              <Button variant={language === "en" ? "default" : "outline"} size="sm">
                🇬🇧 English
              </Button>
            </Link>
            <Link href="/forum?lang=tr">
              <Button variant={language === "tr" ? "default" : "outline"} size="sm">
                🇹🇷 Türkçe
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCategories).map(([type, cats]) => (
              <div key={type}>
                {cats.map((category) => (
                  <Link key={category.id} href={`/forum/category/${category.id}`}>
                    <Card className="card-hover cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{category.icon}</span>
                          <div className="flex-1">
                            <CardTitle className="text-xl">
                              {t[category.name_key as keyof typeof t] || category.name_key}
                            </CardTitle>
                            <CardDescription>
                              {t[category.description_key as keyof typeof t] || category.description_key}
                            </CardDescription>
                          </div>
                          <MessageSquare className="h-6 w-6 text-muted-foreground" />
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
          <Card className="mt-8 border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t.forumLoginPrompt || "Please log in to create topics and participate in discussions"}
              </p>
              <div className="flex justify-center mt-4">
                <Link href="/login">
                  <Button>
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
