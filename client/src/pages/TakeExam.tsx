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
import { Clock, FileText, Printer } from "lucide-react";

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
  const exam = examData as typeof examData & { title: string; dutch_text: string };
  
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">
                {answeredCount} / {questions.length} {t.question}s answered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.print()}
              className="print:hidden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!allAnswered || submitExamMutation.isPending}
              size="lg"
            >
              {submitExamMutation.isPending ? t.loading : t.submitExam}
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Full Text Display */}
        <Card className="p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-6">{exam.title}</h2>
            <div 
              className="whitespace-pre-wrap leading-relaxed text-foreground"
              style={{ 
                columnCount: exam.dutch_text.length > 2000 ? 2 : 1,
                columnGap: '3rem',
                textAlign: 'justify'
              }}
            >
              {exam.dutch_text}
            </div>
          </div>
        </Card>

        {/* Questions Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t.question}s
          </h3>
          
          {questions.map((q: any, index: number) => (
            <Card key={index} className="p-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-primary">
                  {t.question} {index + 1}
                </span>
                <p className="text-lg font-medium mt-2">{q.question}</p>
              </div>
              
              <RadioGroup
                value={answers[index] || ""}
                onValueChange={(value) => setAnswers({ ...answers, [index]: value })}
              >
                <div className="space-y-3">
                  {q.options.map((option: string, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                      <Label 
                        htmlFor={`q${index}-opt${optIndex}`}
                        className="flex-1 cursor-pointer text-base"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </Card>
          ))}
        </div>

        {/* Submit Button (bottom) */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={!allAnswered || submitExamMutation.isPending}
            size="lg"
            className="min-w-[200px]"
          >
            {submitExamMutation.isPending ? t.loading : t.submitExam}
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
