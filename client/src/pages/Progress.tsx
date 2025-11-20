import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AppHeader } from "@/components/AppHeader";

export default function Progress() {
  const { user } = useAuth();
  const { data: stats } = trpc.progress.getMyStats.useQuery(undefined, { enabled: !!user });
  
  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Your Progress</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Exams Completed</CardTitle></CardHeader>
            <CardContent><p className="text-3xl sm:text-4xl font-bold">{stats?.examStats?.totalExams || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Average Score</CardTitle></CardHeader>
            <CardContent><p className="text-3xl sm:text-4xl font-bold">{stats?.examStats?.averageScore ? Number(stats.examStats.averageScore).toFixed(1) : 0}%</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Vocabulary Learned</CardTitle></CardHeader>
            <CardContent><p className="text-3xl sm:text-4xl font-bold">{stats?.user?.total_vocabulary_learned || 0}</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
