import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Users, TrendingUp, Clock, Play } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function PublicExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const { data: texts, isLoading } = trpc.text.listPublicTexts.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to view public exams</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
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
                <Button variant="ghost" size="sm">My Exams</Button>
              </Link>
              <Link href="/public-exams">
                <Button variant="ghost" size="sm">Public Exams</Button>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Public Exams</h2>
            <p className="text-muted-foreground">
              Practice with exams created by the community
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading available exams...</p>
            </div>
          ) : !texts || texts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Public Exams Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create an exam for the community!
                </p>
                <Link href="/create-exam">
                  <Button>Create First Exam</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {texts.map((text) => (
                <Card key={text.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {text.title || `Text #${text.id}`}
                        </CardTitle>
                        <CardDescription>
                          {text.word_count} words • {text.estimated_reading_minutes} min read
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        {text.is_b1_level && (
                          <Badge variant="default">B1 Level</Badge>
                        )}
                        {text.detected_level && (
                          <Badge variant="outline">{text.detected_level}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Text Preview */}
                    <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm line-clamp-3">
                        {text.dutch_text?.substring(0, 200)}...
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Added {new Date(text.created_at).toLocaleDateString()}</span>
                      </div>
                      {text.status && (
                        <Badge variant="outline" className="capitalize">
                          {text.status}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/study/${text.id}`}>
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Start Exam
                        </Button>
                      </Link>
                      <Link href={`/study/${text.id}`}>
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Read Text
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
