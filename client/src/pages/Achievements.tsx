import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Loader2, Trophy, Star, Target, Zap, Award, Medal } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const ACHIEVEMENT_ICONS: Record<string, any> = {
  first_exam: Trophy,
  perfect_score: Star,
  streak_7: Target,
  streak_30: Zap,
  exams_10: Award,
  exams_50: Medal,
  vocab_100: BookOpen,
};

const ACHIEVEMENT_COLORS: Record<string, string> = {
  first_exam: "text-yellow-500",
  perfect_score: "text-purple-500",
  streak_7: "text-blue-500",
  streak_30: "text-green-500",
  exams_10: "text-orange-500",
  exams_50: "text-red-500",
  vocab_100: "text-pink-500",
};

export default function Achievements() {
  const { user } = useAuth();

  const { data: achievements, isLoading } = trpc.progress.getMyAchievements.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (!user) {
    return <NotAuthenticatedPage message="Please log in to view your achievements" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const unlockedCount = achievements?.filter((a: any) => a.unlockedAt).length || 0;
  const totalCount = achievements?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Achievements</h2>
            <p className="text-muted-foreground">
              {unlockedCount} of {totalCount} unlocked
            </p>
            <Progress value={(unlockedCount / totalCount) * 100} className="max-w-md mx-auto mt-4" />
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements?.map((achievement: any) => {
              const Icon = ACHIEVEMENT_ICONS[achievement.type] || Trophy;
              const colorClass = ACHIEVEMENT_COLORS[achievement.type] || "text-gray-500";
              const isUnlocked = !!achievement.unlockedAt;

              return (
                <Card
                  key={achievement.id}
                  className={`relative overflow-hidden transition-all ${
                    isUnlocked
                      ? "border-primary/50 bg-gradient-to-br from-primary/5 to-transparent"
                      : "opacity-60 grayscale"
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="default" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        Unlocked
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      isUnlocked ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Icon className={`h-8 w-8 ${isUnlocked ? colorClass : "text-muted-foreground"}`} />
                    </div>
                    <CardTitle>{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {isUnlocked ? (
                      <p className="text-sm text-muted-foreground">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    ) : achievement.progress !== undefined && achievement.target ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            {achievement.progress} / {achievement.target}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.target) * 100} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Keep going to unlock!</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {(!achievements || achievements.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete exams to start earning achievements
                </p>
                <Link href="/create-exam">
                  <Button>Create Your First Exam</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
