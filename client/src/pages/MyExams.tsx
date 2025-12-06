import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpen, Clock, CheckCircle, XCircle, TrendingUp, RotateCcw,
  Award, Target, Calendar, Search, Trophy, Star, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

// Group exams by text_id
interface GroupedExam {
  textId: number;
  title: string;
  dutchText: string;
  attempts: any[];
  totalAttempts: number;
  completedAttempts: number;
  bestScore: number;
  latestAttempt: any;
  avgScore: number;
}

export default function MyExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: exams, isLoading } = trpc.exam.getMyExams.useQuery();

  // Group exams by text_id
  const groupedExams = useMemo(() => {
    if (!exams || exams.length === 0) return [];

    const groups = new Map<number, GroupedExam>();

    exams.forEach(exam => {
      const textId = exam.text_id;

      if (!groups.has(textId)) {
        groups.set(textId, {
          textId,
          title: exam.title || `Text #${textId}`,
          dutchText: exam.dutch_text || "",
          attempts: [],
          totalAttempts: 0,
          completedAttempts: 0,
          bestScore: 0,
          latestAttempt: exam,
          avgScore: 0,
        });
      }

      const group = groups.get(textId)!;
      group.attempts.push(exam);
      group.totalAttempts++;

      if (exam.status === 'completed') {
        group.completedAttempts++;
        if ((exam.score_percentage || 0) > group.bestScore) {
          group.bestScore = exam.score_percentage || 0;
        }
      }

      // Update latest attempt
      if (new Date(exam.created_at) > new Date(group.latestAttempt.created_at)) {
        group.latestAttempt = exam;
      }
    });

    // Calculate average score for completed attempts
    groups.forEach(group => {
      const completedScores = group.attempts
        .filter(a => a.status === 'completed')
        .map(a => a.score_percentage || 0);

      if (completedScores.length > 0) {
        group.avgScore = Math.round(
          completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length
        );
      }

      // Sort attempts by date (newest first)
      group.attempts.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return Array.from(groups.values());
  }, [exams]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!exams || exams.length === 0) return null;

    const completed = exams.filter(e => e.status === 'completed');
    const inProgress = exams.filter(e => e.status === 'in_progress');

    const totalScore = completed.reduce((sum, e) => sum + (e.score_percentage || 0), 0);
    const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;

    const totalTime = completed.reduce((sum, e) => sum + (e.time_spent_minutes || 0), 0);

    return {
      total: exams.length,
      completed: completed.length,
      inProgress: inProgress.length,
      avgScore,
      totalTime,
      uniqueTexts: groupedExams.length,
    };
  }, [exams, groupedExams]);

  // Filter and sort grouped exams
  const filteredAndSortedGroups = useMemo(() => {
    let filtered = [...groupedExams];

    // Filter by tab
    if (activeTab === 'completed') {
      filtered = filtered.filter(g => g.completedAttempts > 0);
    } else if (activeTab === 'in_progress') {
      filtered = filtered.filter(g =>
        g.attempts.some(a => a.status === 'in_progress')
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(query) ||
        g.dutchText.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) =>
          new Date(b.latestAttempt.created_at).getTime() -
          new Date(a.latestAttempt.created_at).getTime()
        );
        break;
      case 'oldest':
        filtered.sort((a, b) =>
          new Date(a.latestAttempt.created_at).getTime() -
          new Date(b.latestAttempt.created_at).getTime()
        );
        break;
      case 'highest':
        filtered.sort((a, b) => b.bestScore - a.bestScore);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.bestScore - b.bestScore);
        break;
      case 'most_attempts':
        filtered.sort((a, b) => b.totalAttempts - a.totalAttempts);
        break;
    }

    return filtered;
  }, [groupedExams, activeTab, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedGroups.length / itemsPerPage);
  const paginatedGroups = filteredAndSortedGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t.today || 'Vandaag';
    if (diffDays === 1) return t.yesterday || 'Gisteren';
    if (diffDays < 7) return `${diffDays} ${t.daysAgo || 'dagen geleden'}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t.weeksAgo || 'weken geleden'}`;
    return then.toLocaleDateString('nl-NL');
  };

  // Get badge for score
  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { icon: <Trophy className="h-4 w-4" />, text: 'Perfect!', color: 'bg-green-100 text-green-700 border-green-300' };
    if (percentage >= 80) return { icon: <Star className="h-4 w-4" />, text: 'Uitstekend', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    if (percentage >= 60) return { icon: <CheckCircle className="h-4 w-4" />, text: 'Goed', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { icon: <XCircle className="h-4 w-4" />, text: 'Onvoldoende', color: 'bg-red-100 text-red-700 border-red-300' };
  };

  const toggleGroup = (textId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(textId)) {
      newExpanded.delete(textId);
    } else {
      newExpanded.add(textId);
    }
    setExpandedGroups(newExpanded);
  };

  if (!user) {
    return <NotAuthenticatedPage message="Please log in to view your exams" />;
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{t.myExams}</h2>
            <p className="text-muted-foreground">
              {t.trackProgressViewExams || "Volg je voortgang en bekijk je examens"}
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
                <h3 className="text-xl font-semibold mb-2">{t.noExamsYet}</h3>
                <p className="text-muted-foreground mb-4">{t.createFirstExam}</p>
                <Link href="/create-exam">
                  <Button>{t.createNewExam || "Maak je eerste examen"}</Button>
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
                        <div className="text-3xl font-bold text-primary mb-1">{stats.uniqueTexts}</div>
                        <p className="text-sm text-muted-foreground">{t.uniqueTexts || "Unieke Teksten"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-1">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">{t.totalAttempts || "Totale Pogingen"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500 mb-1">{stats.completed}</div>
                        <p className="text-sm text-muted-foreground">{t.completed || "Afgerond"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-1 ${stats.avgScore >= 80 ? 'text-green-500' :
                            stats.avgScore >= 60 ? 'text-yellow-500' :
                              'text-red-500'
                          }`}>
                          {stats.avgScore}%
                        </div>
                        <p className="text-sm text-muted-foreground">{t.averageScore || "Gemiddelde"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="all">
                    {t.all || "Alle"} ({groupedExams.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    {t.completed || "Afgerond"} ({groupedExams.filter(g => g.completedAttempts > 0).length})
                  </TabsTrigger>
                  <TabsTrigger value="in_progress">
                    {t.inProgress || "Bezig"} ({groupedExams.filter(g => g.attempts.some(a => a.status === 'in_progress')).length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchExams || "Zoek examen..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={t.sortBy || "Sorteer op..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t.newestFirst || "Nieuwste eerst"}</SelectItem>
                    <SelectItem value="oldest">{t.oldestFirst || "Oudste eerst"}</SelectItem>
                    <SelectItem value="highest">{t.highestScore || "Hoogste score"}</SelectItem>
                    <SelectItem value="lowest">{t.lowestScore || "Laagste score"}</SelectItem>
                    <SelectItem value="most_attempts">{t.mostAttempts || "Meeste pogingen"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grouped Exams List */}
              {paginatedGroups.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t.noResultsFound || "Geen resultaten gevonden"}</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid gap-4 mb-6">
                    {paginatedGroups.map((group) => {
                      const isExpanded = expandedGroups.has(group.textId);
                      const latestBadge = group.latestAttempt.status === 'completed'
                        ? getScoreBadge(group.latestAttempt.score_percentage || 0)
                        : null;

                      return (
                        <Card key={group.textId} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-xl font-bold mb-2 flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                                  <span className="truncate">{group.title}</span>
                                </CardTitle>
                                <CardDescription className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <Badge variant="outline" className="gap-1">
                                      <RotateCcw className="h-3 w-3" />
                                      {group.totalAttempts} {group.totalAttempts === 1 ? (t.attempt || 'poging') : (t.attempts || 'pogingen')}
                                    </Badge>
                                    {group.completedAttempts > 0 && (
                                      <>
                                        <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-300">
                                          <Trophy className="h-3 w-3" />
                                          {t.best || 'Beste'}: {group.bestScore}%
                                        </Badge>
                                        <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-300">
                                          <TrendingUp className="h-3 w-3" />
                                          {t.average || 'Gem'}: {group.avgScore}%
                                        </Badge>
                                      </>
                                    )}
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      {formatRelativeTime(group.latestAttempt.created_at)}
                                    </span>
                                  </div>
                                </CardDescription>
                              </div>
                              {latestBadge && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${latestBadge.color} text-sm`}>
                                  {latestBadge.icon}
                                  <span className="font-bold">{group.latestAttempt.score_percentage}%</span>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Link href={`/exam/${group.latestAttempt.id}${group.latestAttempt.status === 'completed' ? '/results' : ''}`}>
                                <Button variant="default" size="sm">
                                  {group.latestAttempt.status === 'completed'
                                    ? (t.viewLatest || 'Bekijk Laatste')
                                    : (t.continue || 'Doorgaan')
                                  }
                                </Button>
                              </Link>
                              {group.totalAttempts > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleGroup(group.textId)}
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      {t.hideAttempts || 'Verberg Pogingen'}
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      {t.viewAllAttempts || 'Bekijk Alle Pogingen'} ({group.totalAttempts})
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Expanded Attempts List */}
                            {isExpanded && (
                              <div className="mt-4 space-y-2 border-t pt-4">
                                <h4 className="font-semibold text-sm mb-3">{t.allAttempts || 'Alle Pogingen'}:</h4>
                                {group.attempts.map((attempt, index) => {
                                  const attemptBadge = attempt.status === 'completed'
                                    ? getScoreBadge(attempt.score_percentage || 0)
                                    : null;

                                  return (
                                    <div
                                      key={attempt.id}
                                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-medium">
                                            {t.attempt || 'Poging'} #{group.totalAttempts - index}
                                          </span>
                                          {index === 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                              {t.latest || 'Laatste'}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatRelativeTime(attempt.created_at)}
                                          </span>
                                          {attempt.status === 'completed' && (
                                            <>
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {attempt.time_spent_minutes || 0} min
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Target className="h-3 w-3" />
                                                {attempt.correct_answers}/{attempt.total_questions}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {attemptBadge && (
                                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${attemptBadge.color}`}>
                                            <span className="font-bold">{attempt.score_percentage}%</span>
                                          </div>
                                        )}
                                        <Link href={`/exam/${attempt.id}${attempt.status === 'completed' ? '/results' : ''}`}>
                                          <Button variant="ghost" size="sm">
                                            {attempt.status === 'completed' ? (t.view || 'Bekijk') : (t.continue || 'Doorgaan')}
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        {t.previousPage || 'Vorige'}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {t.page || 'Pagina'} {currentPage} {t.of || 'van'} {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        {t.nextPage || 'Volgende'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
