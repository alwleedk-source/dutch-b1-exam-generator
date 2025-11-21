import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Clock, CheckCircle, XCircle, TrendingUp, RotateCcw, Award, Target, Calendar } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function MyExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const { data: exams, isLoading } = trpc.exam.getMyExams.useQuery();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!exams || exams.length === 0) return null;

    const completed = exams.filter(e => e.status === 'completed');
    const inProgress = exams.filter(e => e.status === 'in_progress');
    
    const totalScore = completed.reduce((sum, e) => sum + (e.score_percentage || 0), 0);
    const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
    
    const totalTime = completed.reduce((sum, e) => sum + (e.time_spent_minutes || 0), 0);
    
    // Calculate performance by question type
    const performanceByType: Record<string, { correct: number; total: number }> = {};
    
    completed.forEach(exam => {
      if (exam.performance_analysis) {
        try {
          const analysis = typeof exam.performance_analysis === 'string' 
            ? JSON.parse(exam.performance_analysis) 
            : exam.performance_analysis;
          
          Object.entries(analysis).forEach(([type, data]: [string, any]) => {
            if (!performanceByType[type]) {
              performanceByType[type] = { correct: 0, total: 0 };
            }
            performanceByType[type].correct += data.correct || 0;
            performanceByType[type].total += data.total || 0;
          });
        } catch (e) {
          console.error('Error parsing performance analysis:', e);
        }
      }
    });

    // Find strongest and weakest areas
    const typePerformances = Object.entries(performanceByType).map(([type, data]) => ({
      type,
      percentage: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      correct: data.correct,
      total: data.total
    })).filter(p => p.total > 0);

    typePerformances.sort((a, b) => b.percentage - a.percentage);
    const strongest = typePerformances[0];
    const weakest = typePerformances[typePerformances.length - 1];

    return {
      total: exams.length,
      completed: completed.length,
      inProgress: inProgress.length,
      avgScore,
      totalTime,
      strongest,
      weakest
    };
  }, [exams]);

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    return then.toLocaleDateString('nl-NL');
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!user) {
    return <NotAuthenticatedPage message="Please log in to view your exams" />;
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{t.myExams}</h2>
            <p className="text-muted-foreground">
              Volg je voortgang en bekijk je examens
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          ) : !exams || exams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nog geen examens</h3>
                <p className="text-muted-foreground mb-4">
                  Begin met oefenen door je eerste examen te maken
                </p>
                <Link href="/create-exam">
                  <Button>{t.createFirstExam || "Maak je eerste examen"}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Statistics Cards */}
              {stats && stats.completed > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">{stats.completed}</div>
                        <p className="text-sm text-muted-foreground">Afgerond</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-1 ${
                          stats.avgScore >= 80 ? 'text-green-500' :
                          stats.avgScore >= 60 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {stats.avgScore}%
                        </div>
                        <p className="text-sm text-muted-foreground">Gemiddelde score</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {stats.strongest && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-lg font-semibold text-green-500">
                              {Math.round(stats.strongest.percentage)}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {stats.strongest.type.replace('_', ' ')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {stats.weakest && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="h-5 w-5 text-orange-500" />
                            <span className="text-lg font-semibold text-orange-500">
                              {Math.round(stats.weakest.percentage)}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {stats.weakest.type.replace('_', ' ')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Exams List */}
              <div className="grid gap-4">
                {exams.map((exam) => {
                  // Parse performance analysis
                  let performanceData: any = null;
                  try {
                    if (exam.performance_analysis) {
                      performanceData = typeof exam.performance_analysis === 'string' 
                        ? JSON.parse(exam.performance_analysis) 
                        : exam.performance_analysis;
                    }
                  } catch (e) {
                    console.error('Error parsing performance:', e);
                  }

                  return (
                    <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              {exam.title || `Examen #${exam.id}`}
                            </CardTitle>
                            <CardDescription className="space-y-1">
                              {exam.dutch_text && (
                                <p className="text-sm line-clamp-2">
                                  {truncateText(exam.dutch_text, 150)}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {exam.status === 'completed' 
                                    ? `Afgerond ${formatRelativeTime(exam.completed_at || exam.created_at)}`
                                    : `Aangemaakt ${formatRelativeTime(exam.created_at)}`
                                  }
                                </span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="text-right ml-4">
                            {exam.status === 'completed' ? (
                              <>
                                <div className={`text-3xl font-bold ${
                                  (exam.score_percentage || 0) >= 80 ? 'text-green-500' :
                                  (exam.score_percentage || 0) >= 60 ? 'text-yellow-500' :
                                  'text-red-500'
                                }`}>
                                  {exam.score_percentage || 0}%
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {exam.correct_answers || 0}/{exam.total_questions} goed
                                </p>
                              </>
                            ) : (
                              <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium">
                                Bezig
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Performance Summary */}
                        {exam.status === 'completed' && performanceData && (
                          <div className="mb-4 p-3 rounded-lg bg-muted/30">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Prestaties per type:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(performanceData).map(([type, data]: [string, any]) => {
                                const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                                const isGood = percentage >= 70;
                                
                                return (
                                  <div 
                                    key={type} 
                                    className={`text-xs px-2 py-1 rounded ${
                                      isGood ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
                                    }`}
                                  >
                                    {isGood ? '✓' : '✗'} {type.replace('_', ' ')}: {data.correct}/{data.total}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{exam.time_spent_minutes || 0} minuten</span>
                          </div>
                          {exam.status === 'completed' && (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{exam.correct_answers || 0} goed</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span>{exam.total_questions - (exam.correct_answers || 0)} fout</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {exam.status === 'completed' ? (
                            <>
                              <Link href={`/exam/${exam.id}/results`}>
                                <Button variant="default" size="sm">
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Bekijk resultaten
                                </Button>
                              </Link>
                              <Link href={`/study/${exam.text_id}`}>
                                <Button variant="outline" size="sm">
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Bestudeer tekst
                                </Button>
                              </Link>
                              <Link href={`/exam/${exam.id}`}>
                                <Button variant="outline" size="sm">
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Opnieuw
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href={`/exam/${exam.id}`}>
                                <Button size="sm">
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Start examen
                                </Button>
                              </Link>
                              <Link href={`/study/${exam.text_id}`}>
                                <Button variant="outline" size="sm">
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Bestudeer tekst
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
