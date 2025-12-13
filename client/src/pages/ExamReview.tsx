import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, CheckCircle, XCircle, AlertCircle, Home, ChevronDown, ChevronUp, Lightbulb, Target } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { getTrapInfo, detectTrapType, type SupportedLanguage, type TrapType } from "@/lib/trapTranslations";


export default function ExamReview() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const params = useParams();
  const examId = parseInt(params.id || "0");

  // Track which question trap analysis sections are expanded
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestionExpanded = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Get user's language for translations
  const userLanguage: SupportedLanguage = (t.languageCode as SupportedLanguage) || 'en';

  const { data: exam, isLoading, error } = trpc.exam.getExamDetails.useQuery({ examId });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.notAuthenticated}</CardTitle>
            <CardDescription>{t.pleaseLogin}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">{t.loading}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.examNotFound}</CardTitle>
            <CardDescription>{t.examNotFoundDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/my-exams">
              <Button className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                {t.myExams}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (exam.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.examNotCompleted}</CardTitle>
            <CardDescription>{t.examNotCompletedDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/exam/${examId}`}>
              <Button className="w-full sm:w-auto">{t.takeExam}</Button>
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
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t.examReview || "Exam Review"}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t.reviewAnswers || "Review your answers"}
            </p>
          </div>

          {/* Score Summary */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{t.score || "Your score"}</p>
                  <p className="text-2xl sm:text-3xl font-bold">{exam.score_percentage}%</p>
                </div>
                <div className="w-full sm:w-auto sm:text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{t.correctAnswers || "Result"}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      <span className="text-sm sm:text-base font-semibold">{exam.correct_answers} {t.correct}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      <span className="text-sm sm:text-base font-semibold">{exam.total_questions - (exam.correct_answers ?? 0)} {t.incorrect}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Review */}
          <div className="space-y-4 sm:space-y-6">
            {questions.map((q: any, index: number) => {
              const userAnswer = userAnswers[index];
              const correctAnswer = String.fromCharCode(65 + (q.correctAnswerIndex || 0)); // 0->A, 1->B, etc.
              const isCorrect = userAnswer === correctAnswer;

              return (
                <Card key={index} className={`border-2 ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0 mt-0.5 sm:mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0 mt-0.5 sm:mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg mb-1 sm:mb-2">
                          {t.question || "Question"} {index + 1}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base text-foreground break-words">
                          {q.question}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Options */}
                    <div className="space-y-2 mb-4">
                      {q.options.map((option: string, optIndex: number) => {
                        const optionLetter = String.fromCharCode(65 + optIndex);
                        const isUserAnswer = userAnswer === optionLetter;
                        const isCorrectOption = correctAnswer === optionLetter;

                        return (
                          <div
                            key={optIndex}
                            className={`p-2.5 sm:p-3 rounded-lg border-2 ${isCorrectOption
                              ? 'border-green-500 bg-green-500/10'
                              : isUserAnswer
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-border'
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-sm sm:text-base flex-shrink-0">{optionLetter}.</span>
                              <span className="text-sm sm:text-base break-words flex-1">{option}</span>
                              {isCorrectOption && (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                              {isUserAnswer && !isCorrectOption && (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* User's Answer */}
                    {!isCorrect && (
                      <Alert className="mb-4 border-red-500/30 bg-red-500/5">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <AlertDescription className="text-xs sm:text-sm">
                          <strong>{t.yourAnswer || "Your answer"}:</strong> {userAnswer || (t.notAnswered || "Not answered")}
                          <br />
                          <strong>{t.correctAnswer || "Correct answer"}:</strong> {correctAnswer}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Trap Analysis - Only for wrong answers */}
                    {!isCorrect && (q.distractorAnalysis || q.distractorTechniques) && (() => {
                      // Try to detect which trap the user fell into
                      const userOptionIndex = userAnswer ? userAnswer.charCodeAt(0) - 65 : -1;
                      const optionKey = `optie${userOptionIndex}`;
                      const analysisText = q.distractorAnalysis?.[optionKey] || '';
                      const detectedTrap = detectTrapType(analysisText);

                      if (!detectedTrap && !analysisText) return null;

                      const trapInfo = detectedTrap ? getTrapInfo(detectedTrap, userLanguage) : null;
                      const isExpanded = expandedQuestions.has(index);

                      return (
                        <div className="mb-4">
                          <button
                            onClick={() => toggleQuestionExpanded(index)}
                            className="w-full p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/15 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                                  {trapInfo?.icon} {t.trapAnalysis || "Why did you choose this?"}
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-orange-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-3">
                              {/* Trap Type */}
                              {trapInfo && (
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">
                                    {t.trapType || "Trap type"}:
                                  </p>
                                  <p className="text-sm font-medium">
                                    {trapInfo.icon} {trapInfo.name}
                                  </p>
                                </div>
                              )}

                              {/* Description */}
                              {trapInfo && (
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">
                                    {t.whatHappened || "What happened"}:
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {trapInfo.description}
                                  </p>
                                </div>
                              )}

                              {/* Original Analysis if available */}
                              {analysisText && (
                                <div>
                                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">
                                    {t.analysis || "Analysis"}:
                                  </p>
                                  <p className="text-sm text-muted-foreground italic">
                                    {analysisText}
                                  </p>
                                </div>
                              )}

                              {/* Tip */}
                              {trapInfo && (
                                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                                        {t.tip || "Tip"}:
                                      </p>
                                      <p className="text-sm">
                                        {trapInfo.tip}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 sm:p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-4">
                        <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1.5 sm:mb-2">
                          💡 {t.explanation || "Explanation"}
                        </p>
                        <p className="text-xs sm:text-sm break-words">{q.explanation}</p>
                      </div>
                    )}

                    {/* Evidence from Text */}
                    {q.evidence && (
                      <div className="p-3 sm:p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <p className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-400 mb-1.5 sm:mb-2">
                          📖 {t.evidenceFromText || "Evidence from text"}
                        </p>
                        <p className="text-xs sm:text-sm italic break-words">"{q.evidence}"</p>
                      </div>
                    )}

                    {/* Question Metadata */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href={`/exam/${examId}/results`}>
              <Button variant="outline" className="w-full sm:w-auto">
                {t.viewResults || "View results"}
              </Button>
            </Link>
            <Link href={`/study/${examId}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <BookOpen className="h-4 w-4 mr-2" />
                {t.studyText || "Study text"}
              </Button>
            </Link>
            <Link href="/my-exams">
              <Button className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                {t.myExams}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
