import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, CheckCircle, XCircle, AlertCircle, Home } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ExamReview() {
  const { user } = useAuth();
  const params = useParams();
  const examId = parseInt(params.id || "0");

  const { data: exam, isLoading, error } = trpc.exam.getExamDetails.useQuery({ examId });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Niet ingelogd</CardTitle>
            <CardDescription>Log in om je examen te bekijken</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Laden...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Examen niet gevonden</CardTitle>
            <CardDescription>Dit examen bestaat niet of is verwijderd.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/my-exams">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Terug naar mijn examens
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (exam.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Examen niet afgerond</CardTitle>
            <CardDescription>Je moet het examen eerst afronden om de antwoorden te bekijken.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/exam/${examId}`}>
              <Button>Ga naar examen</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = JSON.parse(exam.questions);
  const userAnswers = exam.answers ? JSON.parse(exam.answers) : [];

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Antwoorden bekijken</h2>
            <p className="text-muted-foreground">
              Bekijk je antwoorden en leer van je fouten
            </p>
          </div>

          {/* Score Summary */}
          <Card className="mb-8">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Jouw score</p>
                  <p className="text-3xl font-bold">{exam.score_percentage}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Resultaat</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">{exam.correct_answers} goed</span>
                    <XCircle className="h-5 w-5 text-red-500 ml-2" />
                    <span className="font-semibold">{exam.total_questions - exam.correct_answers} fout</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Review */}
          <div className="space-y-6">
            {questions.map((q: any, index: number) => {
              const userAnswer = userAnswers[index];
              const correctAnswer = String.fromCharCode(65 + (q.correctAnswerIndex || 0)); // 0->A, 1->B, etc.
              const isCorrect = userAnswer === correctAnswer;

              return (
                <Card key={index} className={`border-2 ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          Vraag {index + 1}
                        </CardTitle>
                        <CardDescription className="text-base text-foreground">
                          {q.question}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Options */}
                    <div className="space-y-2 mb-4">
                      {q.options.map((option: string, optIndex: number) => {
                        const optionLetter = String.fromCharCode(65 + optIndex);
                        const isUserAnswer = userAnswer === optionLetter;
                        const isCorrectOption = correctAnswer === optionLetter;

                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectOption
                                ? 'border-green-500 bg-green-500/10'
                                : isUserAnswer
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{optionLetter}.</span>
                              <span>{option}</span>
                              {isCorrectOption && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                              {isUserAnswer && !isCorrectOption && (
                                <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* User's Answer */}
                    {!isCorrect && (
                      <Alert className="mb-4 border-red-500/30 bg-red-500/5">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription>
                          <strong>Jouw antwoord:</strong> {userAnswer || 'Niet beantwoord'}
                          <br />
                          <strong>Correct antwoord:</strong> {correctAnswer}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-4">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                          💡 Uitleg
                        </p>
                        <p className="text-sm">{q.explanation}</p>
                      </div>
                    )}

                    {/* Evidence from Text */}
                    {q.evidence && (
                      <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                          📖 Bewijs uit de tekst
                        </p>
                        <p className="text-sm italic">"{q.evidence}"</p>
                      </div>
                    )}

                    {/* Question Metadata */}
                    <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="px-2 py-1 rounded bg-muted">
                        {q.questionType || 'Unknown'}
                      </span>
                      <span className="px-2 py-1 rounded bg-muted capitalize">
                        {q.difficulty || 'medium'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex gap-4 justify-center">
            <Link href={`/exam/${examId}/results`}>
              <Button variant="outline">
                Bekijk resultaten
              </Button>
            </Link>
            <Link href={`/study/${exam.text_id}`}>
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Bestudeer tekst
              </Button>
            </Link>
            <Link href="/my-exams">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Mijn examens
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
