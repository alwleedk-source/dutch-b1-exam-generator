import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, TrendingUp, Target, Flame, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  // Redirect authenticated users to Create Exam page (main page)
  useEffect(() => {
    if (user) {
      setLocation("/create-exam");
    }
  }, [user, setLocation]);
  
  const { data: stats, isLoading: statsLoading } = trpc.progress.getMyStats.useQuery();
  const { data: exams, isLoading: examsLoading } = trpc.exam.getMyExams.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to access your dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold gradient-text">Dutch B1</h1>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/progress">
                <Button variant="ghost">{t.progress}</Button>
              </Link>
              <Link href="/vocabulary">
                <Button variant="ghost">{t.vocabulary}</Button>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost">{t.admin}</Button>
                </Link>
              )}
              <Button variant="outline" onClick={logout}>
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">
            {t.welcomeBack}, {user.name || "Student"}! 👋
          </h2>
          <p className="text-muted-foreground">Ready to practice today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.completedExams}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.user?.total_exams_completed || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.totalExams}
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.averageScore}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : Math.round(Number(stats?.examStats?.averageScore) || 0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Performance
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.myVocabulary}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.user?.total_vocabulary_learned || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.newWords}
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t.currentStreak}</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.user?.current_streak || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create New Exam Button */}
        <div className="mb-8">
          <Link href="/create-exam">
            <Button size="lg" className="w-full md:w-auto gap-2 shadow-glow">
              <Plus className="h-5 w-5" />
              {t.createNewExam}
            </Button>
          </Link>
        </div>

        {/* Recent Exams */}
        <Card>
          <CardHeader>
            <CardTitle>{t.myExams}</CardTitle>
            <CardDescription>Your recent exam attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {examsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 w-full" />
                ))}
              </div>
            ) : exams && exams.length > 0 ? (
              <div className="space-y-4">
                {exams.slice(0, 5).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">Exam #{exam.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {exam.status === "completed"
                          ? `Score: ${exam.score_percentage}%`
                          : t.examInProgress}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {exam.status === "completed" && (
                        <div
                          className={`text-2xl font-bold ${
                            (exam.score_percentage || 0) >= 70
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {exam.score_percentage}%
                        </div>
                      )}
                      {exam.status === "in_progress" && (
                        <Link href={`/exam/${exam.id}`}>
                          <Button size="sm">{t.continue}</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exams yet. Create your first exam to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
