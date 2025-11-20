import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Printer } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/_core/hooks/useAuth";

export default function StudyMode() {
  const { examId } = useParams<{ examId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  // First, get exam details to find the text_id
  const { data: examData, isLoading: examLoading, error: examError } = trpc.exam.getExamDetails.useQuery(
    { examId: parseInt(examId!) },
    { enabled: !!examId, retry: false }
  );

  // Then, get the text using the text_id from exam
  const { data: text, isLoading: textLoading } = trpc.text.getTextWithTranslation.useQuery(
    { text_id: examData?.text_id || 0 },
    { enabled: !!examData?.text_id }
  );

  const submitExamMutation = trpc.exam.submitExam.useMutation({
    onSuccess: (result) => {
      toast.success(`${t.examCompleted || "Exam completed"}! ${t.score || "Score"}: ${result.score_percentage}%`);
      navigate(`/exam/${examData?.id}/results`);
    },
    onError: (error: any) => {
      toast.error("Failed to submit exam: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!examData?.id) return;
    
    const answers = Object.entries(selectedAnswers).map(([questionIndex, answer]) => answer);

    if (answers.length < questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    submitExamMutation.mutate({
      examId: examData.id,
      answers,
      time_spent_minutes: 0,
    });
  };

  // Handle exam error
  if (examError) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Exam Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This exam does not exist or has been deleted.
              </p>
              <Button onClick={() => navigate('/public-exams')}>Browse Exams</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (textLoading || examLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!text?.text) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 container py-8">
          <Card>
            <CardHeader>
              <CardTitle>{t.textNotFound || "Text Not Found"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t.textNotFoundDesc || "The requested text could not be found"}
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                {t.goToDashboard || "Go to Dashboard"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 container py-8">
          <Card>
            <CardHeader>
              <CardTitle>{t.notAuthenticated || "Not Authenticated"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t.pleaseLogin || "Please log in to use Study Mode"}
              </p>
              <Button onClick={() => window.location.href = "/api/auth/google"}>
                {t.login || "Login"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const questions = Array.isArray(examData?.questions) 
    ? examData.questions 
    : (typeof examData?.questions === 'string' ? JSON.parse(examData.questions) : []);
  const wordCount = text?.text?.word_count || 0;
  const readingTime = text?.text?.estimated_reading_minutes || Math.ceil(wordCount / 200);

  return (
    <>
      <AppHeader />
      <main className="container py-8 max-w-5xl no-print">
        {/* Header with Print Button */}
        <div className="flex justify-between items-center mb-6 no-print">
          <div>
            <h1 className="text-3xl font-bold">{text?.text?.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {wordCount} {t.words || "words"} • {readingTime} {t.minRead || "min read"}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            {t.print || "Print"}
          </Button>
        </div>

        {/* Dutch Text */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t.dutchText || "Dutch Text"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-lg max-w-none"
              style={{
                direction: 'ltr',
                lineHeight: '1.8',
                fontSize: '1.1rem',
              }}
            >
              <div 
                className="text-foreground"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordSpacing: '0.1em',
                  letterSpacing: '0.01em',
                }}
                dangerouslySetInnerHTML={{
                  __html: text?.text?.dutch_text?.replace(/\n\n/g, '</p><p style="margin-top: 1.5em; margin-bottom: 1.5em;">').replace(/^/, '<p style="margin-top: 0;">').replace(/$/, '</p>')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t.question || "Questions"} ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(questions as any[]).map((q: any, index: number) => (
                <div key={index} className="border-b pb-6 last:border-0">
                  <h3 className="font-semibold mb-3">
                    {index + 1}. {q.question}
                  </h3>
                  <RadioGroup
                    value={selectedAnswers[index] || ""}
                    onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [index]: value }))}
                  >
                    {q.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                        <Label htmlFor={`q${index}-opt${optIndex}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <Button 
                onClick={handleSubmit} 
                disabled={submitExamMutation.isPending}
                className="w-full"
                size="lg"
              >
                {submitExamMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.loading || "Loading..."}
                  </>
                ) : (
                  t.submitExam || "Submit Exam"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
            color: black;
          }
          * {
            color: black !important;
            background: white !important;
          }
        }
      `}</style>
    </>
  );
}
