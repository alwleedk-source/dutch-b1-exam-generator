import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Clock, CheckCircle, XCircle, TrendingUp, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function MyExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const { data: exams, isLoading } = trpc.exam.getMyExams.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to view your exams</CardDescription>
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
            
            <nav className="flex items-center gap-2">
              <Link href="/create-exam">
                <Button variant="ghost" size="sm">{t.createNewExam || "Create Exam"}</Button>
              </Link>
              <Link href="/my-exams">
                <Button variant="ghost" size="sm">{t.myExams}</Button>
              </Link>
              <Link href="/public-exams">
                <Button variant="ghost" size="sm">{t.publicExams}</Button>
              </Link>
              <Link href="/progress">
                <Button variant="ghost" size="sm">{t.progress || "Progress"}</Button>
              </Link>
              <Link href="/vocabulary">
                <Button variant="ghost" size="sm">{t.vocabulary || "Vocabulary"}</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t.logout || "Logout"}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{t.myExams}</h2>
            <p className="text-muted-foreground">
              {t.examHistory}
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
                <p className="text-muted-foreground mb-4">
                  {t.noExamsYet}
                </p>
                <Link href="/create-exam">
                  <Button>{t.createFirstExam}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {exams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          Exam #{exam.id}
                        </CardTitle>
                        <CardDescription>
                          Completed on {new Date(exam.completed_at || exam.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          (exam.score_percentage || 0) >= 80 ? 'text-green-500' :
                          (exam.score_percentage || 0) >= 60 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {exam.score_percentage || 0}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {exam.correct_answers || 0}/{exam.total_questions} correct
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{exam.time_spent_minutes || 0} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{exam.correct_answers || 0} correct</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>{exam.total_questions - (exam.correct_answers || 0)} incorrect</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/exam/${exam.id}`}>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {t.viewResults}
                        </Button>
                      </Link>
                      <Link href={`/study/${exam.text_id}`}>
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {t.studyText}
                        </Button>
                      </Link>
                      <Link href={`/exam/${exam.id}/retake`}>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {t.retake}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
