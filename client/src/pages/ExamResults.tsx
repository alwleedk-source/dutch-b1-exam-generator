import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, TrendingUp, TrendingDown, BookOpen, RotateCcw, Home, Award, Eye, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { RatingDialog } from "@/components/RatingDialog";

export default function ExamResults() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const examId = params.id ? parseInt(params.id) : null;
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  const { data: examData, isLoading, error } = trpc.exam.getExamDetails.useQuery(
    { examId: examId! },
    { enabled: !!examId, retry: false }
  );

  // Check if user has already rated this text
  const { data: userRating } = trpc.rating.getUserRating.useQuery(
    { text_id: examData?.text_id! },
    { enabled: !!examData?.text_id && !!user }
  );

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{t.examNotFound}</h2>
            <p className="text-muted-foreground mb-4">{t.examNotFoundDesc}</p>
            <Button onClick={() => setLocation('/my-exams')}>{t.myExams}</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Handle loading state
  if (isLoading || !examData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loadingResults}</p>
        </div>
      </div>
    );
  }

  // Check if exam is completed
  if (examData.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{t.examNotCompleted}</h2>
            <p className="text-muted-foreground mb-4">{t.examNotCompletedDesc}</p>
            <Button onClick={() => setLocation(`/exam/${examId}`)}>{t.takeExam}</Button>
          </div>
        </Card>
      </div>
    );
  }

  const scorePercentage = examData.score_percentage || 0;
  const correctAnswers = examData.correct_answers || 0;
  const totalQuestions = examData.total_questions || 0;
  const passed = scorePercentage >= 60;

  // Parse performance analysis if available
  let performanceAnalysis: any = null;
  let recommendations: string[] = [];
  let skillAnalysis: any = null;
  
  try {
    if (typeof examData.performance_analysis === 'string') {
      performanceAnalysis = JSON.parse(examData.performance_analysis);
    } else {
      performanceAnalysis = examData.performance_analysis;
    }
    if (typeof examData.recommendations === 'string') {
      recommendations = JSON.parse(examData.recommendations);
    } else if (Array.isArray(examData.recommendations)) {
      recommendations = examData.recommendations;
    }
    if (typeof examData.skill_analysis === 'string') {
      skillAnalysis = JSON.parse(examData.skill_analysis);
    } else {
      skillAnalysis = examData.skill_analysis;
    }
  } catch (e) {
    console.error('Error parsing performance data:', e);
  }
  
  // Skill icons and names
  const skillIcons: Record<string, string> = {
    hoofdgedachte: '🎯',
    zoeken: '🔍',
    volgorde: '📋',
    conclusie: '💡',
    woordenschat: '📚',
  };
  
  const skillColors: Record<string, string> = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    needs_improvement: 'bg-yellow-500',
    weak: 'bg-red-500',
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Card */}
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`h-24 w-24 sm:h-32 sm:w-32 rounded-full ${passed ? 'bg-green-500/10' : 'bg-yellow-500/10'} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl font-bold" style={{ color: passed ? '#22c55e' : '#eab308' }}>
                      {scorePercentage}%
                    </div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl mb-2">
                {t.yourResult || "Your Result"}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base px-4">
                {passed 
                  ? (t.examPassedMessage || "Well done! Keep practicing to improve your skills")
                  : (t.examFailedMessage || "Keep practicing, you're on the right track!")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Basic Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-4 rounded-lg bg-green-500/5">
                  <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">{correctAnswers}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t.correct || "Correct"}</p>
                </div>
                <div className="text-center p-2 sm:p-4 rounded-lg bg-red-500/5">
                  <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">{totalQuestions - correctAnswers}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t.incorrect || "Incorrect"}</p>
                </div>
                <div className="text-center p-2 sm:p-4 rounded-lg bg-primary/5">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{totalQuestions}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t.total || "Total"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NT2 Skill Analysis */}
          {skillAnalysis && skillAnalysis.bySkill && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  NT2 Lezen I - Vaardighedenanalyse
                </CardTitle>
                <CardDescription>
                  Jouw prestaties per leesvaardighed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills Grid */}
                <div className="grid gap-4">
                  {skillAnalysis.bySkill.map((skill: any) => {
                    const icon = skillIcons[skill.skillType] || '📚';
                    const colorClass = skillColors[skill.level] || 'bg-gray-500';
                    
                    return (
                      <div key={skill.skillType} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{icon}</div>
                            <div>
                              <h4 className="font-semibold">{skill.skillName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {skill.correct}/{skill.total} correct
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{skill.percentage}%</div>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass} text-white mt-1`}>
                              {skill.level === 'excellent' && 'Uitstekend'}
                              {skill.level === 'good' && 'Goed'}
                              {skill.level === 'needs_improvement' && 'Verbetering nodig'}
                              {skill.level === 'weak' && 'Zwak'}
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={skill.percentage} 
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Strengths and Weaknesses */}
                {(skillAnalysis.strengths.length > 0 || skillAnalysis.weaknesses.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    {skillAnalysis.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Sterke punten
                        </h4>
                        <ul className="space-y-1">
                          {skillAnalysis.strengths.map((skillType: string) => (
                            <li key={skillType} className="text-sm flex items-center gap-2">
                              <span>{skillIcons[skillType]}</span>
                              <span>{skillAnalysis.bySkill.find((s: any) => s.skillType === skillType)?.skillName}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {skillAnalysis.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Zwakke punten
                        </h4>
                        <ul className="space-y-1">
                          {skillAnalysis.weaknesses.map((skillType: string) => (
                            <li key={skillType} className="text-sm flex items-center gap-2">
                              <span>{skillIcons[skillType]}</span>
                              <span>{skillAnalysis.bySkill.find((s: any) => s.skillType === skillType)?.skillName}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Skill-based Recommendations */}
                {skillAnalysis.recommendations && skillAnalysis.recommendations.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Aanbevelingen voor verbetering</h4>
                    <ul className="space-y-2">
                      {skillAnalysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-primary">{index + 1}</span>
                          </div>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Performance Analysis */}
          {performanceAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Prestatie-analyse
                </CardTitle>
                <CardDescription>
                  Jouw prestaties per vraagtype
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceAnalysis && Object.entries(performanceAnalysis).map(([type, data]: [string, any]) => {
                  const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                  const isStrong = percentage >= 70;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isStrong ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {data.correct}/{data.total} correct ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isStrong ? 'bg-green-100' : 'bg-red-100'}`}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Aanbevelingen voor verbetering
                </CardTitle>
                <CardDescription>
                  Focus op deze gebieden om je score te verbeteren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm">{rec}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/exam/${examId}/review`}>
              <Button size="lg">
                <Eye className="h-4 w-4 mr-2" />
                Bekijk antwoorden
              </Button>
            </Link>
            {!userRating && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowRatingDialog(true)}
              >
                <Star className="h-4 w-4 mr-2" />
                {t.rateThisExam || 'Rate this exam'}
              </Button>
            )}
            <Link href={`/study/${examId}`}>
              <Button variant="outline" size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Bestudeer de tekst
              </Button>
            </Link>
            <Link href={`/exam/${examId}`}>
              <Button variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Probeer opnieuw
              </Button>
            </Link>
            <Link href="/my-exams">
              <Button variant="outline" size="lg">
                Mijn examens
              </Button>
            </Link>
          </div>
          
          {/* Rating Dialog */}
          {examData.text_id && (
            <RatingDialog
              textId={examData.text_id}
              open={showRatingDialog}
              onOpenChange={setShowRatingDialog}
            />
          )}
        </div>
      </main>
    </div>
  );
}
