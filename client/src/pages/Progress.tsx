import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { AppHeader } from "@/components/AppHeader";
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Target, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Progress() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: stats } = trpc.progress.getMyStats.useQuery(undefined, { enabled: !!user });
  const { data: detailedAnalysis } = trpc.progress.getDetailedAnalysis.useQuery(undefined, { enabled: !!user });

  const skillCategories = [
    { key: "main_idea", label: "Hoofdgedachte (Main Idea)", icon: Target },
    { key: "search", label: "Zoeken (Search)", icon: BookOpen },
    { key: "sequence", label: "Volgorde (Sequence)", icon: CheckCircle },
    { key: "inference", label: "Conclusie (Inference)", icon: TrendingUp },
    { key: "vocabulary", label: "Woordenschat (Vocabulary)", icon: BookOpen },
  ];

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t.myProgress}</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">{t.completedExams}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-bold">{stats?.examStats?.totalExams || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">{t.averageScore}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl sm:text-4xl font-bold ${getPerformanceColor(stats?.examStats?.averageScore || 0)}`}>
                {stats?.examStats?.averageScore ? Number(stats.examStats.averageScore).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">{t.totalQuestions}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-bold">{detailedAnalysis?.totalQuestions || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">{t.correctlyAnswered}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-bold text-green-600">{detailedAnalysis?.totalCorrect || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Question Type */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t.performanceByType}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.performanceByTypeDesc}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {skillCategories.map((skill) => {
                const skillData = detailedAnalysis?.byQuestionType?.[skill.key];
                const percentage = skillData && skillData.total > 0 ? (skillData.correct / skillData.total) * 100 : 0;
                const Icon = skill.icon;

                return (
                  <div key={skill.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{skill.label}</span>
                        {getPerformanceIcon(percentage)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {skillData?.correct || 0}/{skillData?.total || 0}
                        </span>
                        <span className={`text-lg font-bold ${getPerformanceColor(percentage)}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Sterke Punten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {detailedAnalysis?.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">Maak meer examens om je sterke punten te ontdekken</li>}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Verbeterpunten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {detailedAnalysis?.weaknesses?.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">→</span>
                    <span className="text-sm">{weakness}</span>
                  </li>
                )) || <li className="text-sm text-muted-foreground">Maak meer examens om je verbeterpunten te ontdekken</li>}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {detailedAnalysis?.recommendations && detailedAnalysis.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.recommendations}</CardTitle>
              <p className="text-sm text-muted-foreground">{t.personalizedTips}</p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 list-decimal list-inside">
                {detailedAnalysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
