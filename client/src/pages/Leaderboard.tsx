import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: weeklyLeaders } = trpc.progress.getLeaderboard.useQuery({ period: 'week' });
  const { data: monthlyLeaders } = trpc.progress.getLeaderboard.useQuery({ period: 'month' });
  const { data: allTimeLeaders } = trpc.progress.getLeaderboard.useQuery({ period: 'all' });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const LeaderboardTable = ({ leaders }: { leaders: any[] | undefined }) => {
    if (!leaders || leaders.length === 0) {
      return (
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No data yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {leaders.map((leader, index) => (
          <div
            key={leader.userId}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
              user?.id === leader.userId
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            }`}
          >
            <div className="w-12 flex items-center justify-center">
              {getRankIcon(index + 1)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{leader.name || "Anonymous"}</h4>
                {user?.id === leader.userId && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {leader.totalExams} exams completed
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {leader.averageScore.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-8 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Leaderboard</h2>
            <p className="text-muted-foreground">
              Top performers in Dutch B1 exam practice
            </p>
          </div>

          {/* Leaderboard Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Top Scores</CardTitle>
              <CardDescription>
                Rankings based on average exam scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="week" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>

                <TabsContent value="week" className="mt-6">
                  <LeaderboardTable leaders={weeklyLeaders} />
                </TabsContent>

                <TabsContent value="month" className="mt-6">
                  <LeaderboardTable leaders={monthlyLeaders} />
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <LeaderboardTable leaders={allTimeLeaders} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* CTA */}
          {user && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Want to climb the ranks? Practice more!
              </p>
              <Link href="/create">
                <Button size="lg">Create New Exam</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
