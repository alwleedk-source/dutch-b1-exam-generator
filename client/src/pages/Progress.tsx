import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function Progress() {
  const { user } = useAuth();
  const { data: stats } = trpc.progress.getMyStats.useQuery(undefined, { enabled: !!user });
  
  return (
    <div className="min-h-screen p-8 bg-gradient-bg">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Progress</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Exams Completed</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold">{stats?.examStats?.totalExams || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Average Score</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold">{stats?.examStats?.averageScore?.toFixed(1) || 0}%</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Vocabulary Learned</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold">{stats?.user?.total_vocabulary_learned || 0}</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
