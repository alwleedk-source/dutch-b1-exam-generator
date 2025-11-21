import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Clock, CheckCircle, XCircle, TrendingUp, RotateCcw, Award, Target, Calendar, Search, Trophy, Star } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";

export default function MyExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

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

  // Filter and sort exams
  const filteredAndSortedExams = useMemo(() => {
    if (!exams) return [];
    
    let filtered = exams;
    
    // Filter by tab
    if (activeTab === 'completed') {
      filtered = filtered.filter(e => e.status === 'completed');
    } else if (activeTab === 'in_progress') {
      filtered = filtered.filter(e => e.status === 'in_progress');
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        (e.title && e.title.toLowerCase().includes(query)) ||
        (e.dutch_text && e.dutch_text.toLowerCase().includes(query))
      );
    }
    
    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => (b.score_percentage || 0) - (a.score_percentage || 0));
        break;
      case 'lowest':
        sorted.sort((a, b) => (a.score_percentage || 0) - (b.score_percentage || 0));
        break;
    }
    
    return sorted;
  }, [exams, activeTab, searchQuery, sortBy]);

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

  // Get badge for score
  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { icon: <Trophy className="h-5 w-5" />, text: 'Perfect!', color: 'bg-green-100 text-green-700 border-green-300' };
    if (percentage >= 80) return { icon: <Star className="h-5 w-5" />, text: 'Uitstekend', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    if (percentage >= 60) return { icon: <CheckCircle className="h-5 w-5" />, text: 'Goed', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { icon: <XCircle className="h-5 w-5" />, text: 'Onvoldoende', color: 'bg-red-100 text-red-700 border-red-300' };
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                        <p className="text-sm text-muted-foreground">Gemiddelde</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {stats.strongest && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="text-lg font-semibold text-green-500">
                              💪 {Math.round(stats.strongest.percentage)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize line-clamp-1">
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
                            <span className="text-lg font-semibold text-orange-500">
                              🎯 {Math.round(stats.weakest.percentage)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize line-clamp-1">
                            {stats.weakest.type.replace('_', ' ')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="all">
                    Alle ({exams.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Afgerond ({stats?.completed || 0})
                  </TabsTrigger>
                  <TabsTrigger value="in_progress">
                    Bezig ({stats?.inProgress || 0})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek examen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Sorteer op..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Nieuwste eerst</SelectItem>
                    <SelectItem value="oldest">Oudste eerst</SelectItem>
                    <SelectItem value="highest">Hoogste score</SelectItem>
                    <SelectItem value="lowest">Laagste score</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exams List */}
              {filteredAndSortedExams.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Geen examens gevonden</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredAndSortedExams.map((exam) => {
                    // Parse performance analysis
                    let performanceData: any = null;
                    let strongest: { type: string; percentage: number } | null = null;
                    let weakest: { type: string; percentage: number } | null = null;
                    
                    try {
                      if (exam.performance_analysis) {
                        performanceData = typeof exam.performance_analysis === 'string' 
                          ? JSON.parse(exam.performance_analysis) 
                          : exam.performance_analysis;
                        
                        // Find strongest and weakest
                        const performances = Object.entries(performanceData).map(([type, data]: [string, any]) => ({
                          type,
                          percentage: data.total > 0 ? (data.correct / data.total) * 100 : 0
                        })).filter(p => p.percentage > 0);
                        
                        if (performances.length > 0) {
                          performances.sort((a, b) => b.percentage - a.percentage);
                          strongest = performances[0];
                          weakest = performances[performances.length - 1];
                        }
                      }
                    } catch (e) {
                      console.error('Error parsing performance:', e);
                    }

                    const scorePercentage = exam.score_percentage || 0;
                    const badge = exam.status === 'completed' ? getScoreBadge(scorePercentage) : null;

                    return (
                      <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-primary flex-shrink-0" />
                                <span className="truncate">{exam.title || `Examen #${exam.id}`}</span>
                              </CardTitle>
                              <CardDescription className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {exam.status === 'completed' 
                                      ? `Afgerond ${formatRelativeTime(exam.completed_at || exam.created_at)}`
                                      : `Aangemaakt ${formatRelativeTime(exam.created_at)}`
                                    }
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {exam.time_spent_minutes || 0} min
                                  </span>
                                  {exam.status === 'completed' && (
                                    <span className="flex items-center gap-1">
                                      <Target className="h-4 w-4" />
                                      {exam.correct_answers}/{exam.total_questions}
                                    </span>
                                  )}
                                </div>
                              </CardDescription>
                            </div>
                            <div className="flex-shrink-0">
                              {exam.status === 'completed' && badge ? (
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${badge.color}`}>
                                  {badge.icon}
                                  <div className="text-center">
                                    <div className="text-2xl font-bold leading-none">{scorePercentage}%</div>
                                    <div className="text-xs font-medium mt-0.5">{badge.text}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium border-2 border-yellow-300">
                                  Bezig
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Performance Summary - Only show strongest and weakest */}
                          {exam.status === 'completed' && (strongest || weakest) && (
                            <div className="mb-4 flex flex-wrap gap-2">
                              {strongest && (
                                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm border border-green-200">
                                  <span>💪</span>
                                  <span className="font-medium capitalize">{strongest.type.replace('_', ' ')}</span>
                                  <span className="font-bold">({Math.round(strongest.percentage)}%)</span>
                                </div>
                              )}
                              {weakest && strongest?.type !== weakest?.type && (
                                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm border border-orange-200">
                                  <span>🎯</span>
                                  <span className="font-medium capitalize">{weakest.type.replace('_', ' ')}</span>
                                  <span className="font-bold">({Math.round(weakest.percentage)}%)</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {exam.status === 'completed' ? (
                              <>
                                <Link href={`/exam/${exam.id}/results`}>
                                  <Button variant="default" size="sm">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Resultaten
                                  </Button>
                                </Link>
                                <Link href={`/study/${exam.text_id}`}>
                                  <Button variant="outline" size="sm">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Bestudeer
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
                                    Bestudeer
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
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
