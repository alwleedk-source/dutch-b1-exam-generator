import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Users, TrendingUp, Clock, Play } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function PublicExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [generatingExamId, setGeneratingExamId] = useState<number | null>(null);

  const { data: texts, isLoading } = trpc.text.listPublicTexts.useQuery();
  
  const generateExamMutation = trpc.exam.generateExam.useMutation({
    onSuccess: (data) => {
      // Redirect immediately without showing toast (faster UX)
      setLocation(`/exam/${data.examId}`);
    },
    onError: (error) => {
      toast.error("Failed to generate exam: " + error.message);
      setGeneratingExamId(null);
    },
  });
  
  const handleStartExam = (textId: number) => {
    setGeneratingExamId(textId);
    generateExamMutation.mutate({ text_id: textId });
  };

  if (!user) {
    return <NotAuthenticatedPage message="Please log in to view public exams" />;
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{t.publicExams}</h2>
            <p className="text-muted-foreground">
              {t.allExams}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          ) : !texts || texts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t.noExamsYet}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.createFirstExam}
                </p>
                <Link href="/create-exam">
                  <Button>{t.createFirstExam}</Button>
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
                          {text.word_count} {t.words} • {text.estimated_reading_minutes} {t.minRead}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        {text.is_b1_level && (
                          <Badge variant="default">B1 {t.levelDetected || "Level"}</Badge>
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
                      <p className="text-sm line-clamp-3" dir="ltr">
                        {text.dutch_text?.substring(0, 200)}...
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{t.added} {new Date(text.created_at).toLocaleDateString()}</span>
                      </div>
                      {text.status && (
                        <Badge variant="outline" className="capitalize">
                          {text.status}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleStartExam(text.id)}
                        disabled={generatingExamId === text.id}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {generatingExamId === text.id ? t.loading : t.startExam}
                      </Button>
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
