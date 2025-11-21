import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, FileText, Printer, Home, X, BookOpen } from "lucide-react";
import { Link } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TakeExam() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const params = useParams();
  const [, setLocation] = useLocation();
  const examId = params.id ? parseInt(params.id) : null;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [startTime] = useState(Date.now());
  
  const { data: examData, error: examError, isLoading: examLoading } = trpc.exam.getExamDetails.useQuery(
    { examId: examId! }, 
    { enabled: !!examId, retry: false }
  );
  const exam = examData as typeof examData & { title: string; dutch_text: string; formatted_html?: string; text_type?: string };
  
  const submitExamMutation = trpc.exam.submitExam.useMutation({
    onSuccess: (data) => {
      toast.success(`${t.examCompleted}! ${t.score}: ${data.correct_answers}/${data.total_questions}`);
      setLocation(`/exam/${examId}/results`);
    },
    onError: (error) => {
      toast.error("Failed to submit exam: " + error.message);
    },
  });
  
  // Handle error state
  if (examError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Exam Not Found</h2>
            <p className="text-muted-foreground mb-4">This exam does not exist or has been deleted.</p>
            <Button onClick={() => setLocation('/public-exams')}>Browse Exams</Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Handle loading state
  if (examLoading || !exam) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    </div>
  );
  
  const questions = JSON.parse(exam.questions as string);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  
  const handleSubmit = () => {
    if (!allAnswered) {
      toast.error(`Please answer all questions (${answeredCount}/${questions.length} answered)`);
      return;
    }
    
    const timeSpentMinutes = Math.floor((Date.now() - startTime) / 60000);
    submitExamMutation.mutate({
      examId: examId!,
      answers: Object.values(answers),
      time_spent_minutes: timeSpentMinutes,
    });
  };
  
  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .sticky { position: relative !important; }
          .container { max-width: 100% !important; padding: 0 !important; }
          .prose { max-width: 100% !important; }
          button, .no-print { display: none !important; }
          * { color: black !important; background: white !important; }
          h1, h2, h3 { color: black !important; font-weight: bold !important; }
          p { line-height: 1.6 !important; margin-bottom: 0.5rem !important; }
        }
      `}</style>
      <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b print:hidden">
        <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/">
                <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  <span className="font-bold text-base sm:text-lg gradient-text hidden xs:inline">Dutch B1</span>
                </div>
              </Link>
              <div className="h-5 sm:h-6 w-px bg-border hidden sm:block" />
              <div className="hidden sm:block min-w-0">
                <h1 className="font-semibold text-sm truncate">{exam.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {answeredCount} / {questions.length} vragen beantwoord
                </p>
              </div>
            </div>

            {/* Mobile Progress */}
            <div className="sm:hidden flex-shrink-0">
              <p className="text-xs sm:text-sm font-medium">
                {answeredCount}/{questions.length}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <LanguageSwitcher />
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
                className="hidden md:flex"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                variant="ghost"
                size="icon"
                className="sm:hidden h-8 w-8"
                onClick={() => {
                  if (answeredCount > 0) {
                    if (confirm('Weet je zeker dat je het examen wilt verlaten? Je voortgang gaat verloren.')) {
                      setLocation('/my-exams');
                    }
                  } else {
                    setLocation('/my-exams');
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (answeredCount > 0) {
                    if (confirm('Weet je zeker dat je het examen wilt verlaten? Je voortgang gaat verloren.')) {
                      setLocation('/my-exams');
                    }
                  } else {
                    setLocation('/my-exams');
                  }
                }}
                className="hidden sm:flex"
              >
                <X className="h-4 w-4 mr-2" />
                Afsluiten
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!allAnswered || submitExamMutation.isPending}
                size="sm"
              >
                {submitExamMutation.isPending ? t.loading : 'Indienen'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Full Text Display */}
        <Card className="p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{exam.title}</h2>
            {exam.formatted_html ? (
              <div 
                className="formatted-text-container"
                style={{ direction: 'ltr' }}
                dangerouslySetInnerHTML={{ __html: exam.formatted_html }}
              />
            ) : (
              <div 
                className="whitespace-pre-wrap leading-relaxed text-foreground"
                style={{ 
                  direction: 'ltr',
                  columnCount: window.innerWidth >= 1024 && exam.dutch_text.length > 2000 ? 2 : 1,
                  columnGap: '3rem',
                  textAlign: window.innerWidth >= 640 ? 'justify' : 'left'
                }}
              >
                {exam.dutch_text}
              </div>
            )}
          </div>
        </Card>

        {/* Questions Section */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            {t.question}s
          </h3>
          
          {questions.map((q: any, index: number) => (
            <Card key={index} className="p-4 sm:p-6">
              <div className="mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {t.question} {index + 1}
                </span>
                <p className="text-base sm:text-lg font-medium mt-1.5 sm:mt-2" dir="ltr">{q.question}</p>
              </div>
              
              <RadioGroup
                value={answers[index] || ""}
                onValueChange={(value) => setAnswers({ ...answers, [index]: value })}
              >
                <div className="space-y-2 sm:space-y-3">
                  {q.options.map((option: string, optIndex: number) => {
                    const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                    return (
                    <div key={optIndex} className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value={optionLetter} id={`q${index}-opt${optIndex}`} className="flex-shrink-0" />
                      <Label 
                        htmlFor={`q${index}-opt${optIndex}`}
                        className="flex-1 cursor-pointer text-sm sm:text-base leading-snug"
                        dir="ltr"
                      >
                        {option}
                      </Label>
                    </div>
                  );})}
                </div>
              </RadioGroup>
            </Card>
          ))}
        </div>

        {/* Submit Button (bottom) */}
        <div className="mt-6 sm:mt-8 flex justify-center pb-4">
          <Button 
            onClick={handleSubmit} 
            disabled={!allAnswered || submitExamMutation.isPending}
            size="lg"
            className="w-full sm:w-auto sm:min-w-[200px]"
          >
            {submitExamMutation.isPending ? t.loading : t.submitExam}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
