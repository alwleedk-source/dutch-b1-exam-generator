import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, TrendingUp, TrendingDown, BookOpen, RotateCcw, Home, Award, Eye } from "lucide-react";

export default function ExamResults() {
  const { user } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const examId = params.id ? parseInt(params.id) : null;

  const { data: examData, isLoading, error } = trpc.exam.getExamDetails.useQuery(
    { examId: examId! },
    { enabled: !!examId, retry: false }
  );

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Exam Not Found</h2>
            <p className="text-muted-foreground mb-4">This exam does not exist or has been deleted.</p>
            <Button onClick={() => setLocation('/my-exams')}>My Exams</Button>
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
          <p className="text-muted-foreground">Loading results...</p>
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
            <h2 className="text-xl font-semibold mb-2">Exam Not Completed</h2>
            <p className="text-muted-foreground mb-4">You need to complete this exam first to see the results.</p>
            <Button onClick={() => setLocation(`/exam/${examId}`)}>Take Exam</Button>
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
  } catch (e) {
    console.error('Error parsing performance data:', e);
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
            
            <nav className="flex items-center gap-2">
              <Link href="/my-exams">
                <Button variant="ghost" size="sm">My Exams</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Card */}
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`h-32 w-32 rounded-full ${passed ? 'bg-green-500/10' : 'bg-yellow-500/10'} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="text-5xl font-bold" style={{ color: passed ? '#22c55e' : '#eab308' }}>
                      {scorePercentage}%
                    </div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl mb-2">
                Jouw resultaat
              </CardTitle>
              <CardDescription className="text-base">
                {passed 
                  ? 'Goed gedaan! Blijf oefenen om je vaardigheden te verbeteren'
                  : 'Blijf oefenen, je bent op de goede weg!'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Basic Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/5">
                  <div className="text-3xl font-bold text-green-500 mb-1">{correctAnswers}</div>
                  <p className="text-sm text-muted-foreground">Goed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/5">
                  <div className="text-3xl font-bold text-red-500 mb-1">{totalQuestions - correctAnswers}</div>
                  <p className="text-sm text-muted-foreground">Fout</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-3xl font-bold text-primary mb-1">{totalQuestions}</div>
                  <p className="text-sm text-muted-foreground">Totaal</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                {Object.entries(performanceAnalysis).map(([type, data]: [string, any]) => {
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
            <Link href={`/study/${examData.text_id}`}>
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
        </div>
      </main>
    </div>
  );
}
