import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Loader2, CheckCircle, XCircle, RotateCcw, Volume2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function ReviewPractice() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const { data: dueCards, isLoading, refetch } = trpc.vocabulary.getDueForReview.useQuery(
    undefined,
    { enabled: !!user }
  );

  const submitReviewMutation = trpc.vocabulary.submitReview.useMutation({
    onSuccess: () => {
      setReviewedCount(prev => prev + 1);
      setShowAnswer(false);
      
      if (currentIndex < (dueCards?.length || 0) - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast.success("Review session complete!");
        refetch();
        setCurrentIndex(0);
      }
    },
    onError: (error) => {
      toast.error("Failed to submit review: " + error.message);
    },
  });

  const handleQualityRating = (quality: number) => {
    if (!dueCards || !dueCards[currentIndex]) return;
    
    submitReviewMutation.mutate({
      userVocabId: dueCards[currentIndex].id,
      quality,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to practice vocabulary</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!dueCards || dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <header className="border-b border-border/50 glass sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold gradient-text">Dutch B1</h1>
                </div>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">All caught up!</h3>
                <p className="text-muted-foreground mb-6">
                  No vocabulary due for review right now. Great job!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/vocabulary">
                    <Button variant="outline">View Vocabulary</Button>
                  </Link>
                  <Link href="/create-exam">
                    <Button>Create New Exam</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  const progress = ((currentIndex + 1) / dueCards.length) * 100;

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
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {dueCards.length}
              </span>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Exit</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Review Progress</span>
              <span className="font-semibold">{reviewedCount} reviewed</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Flashcard */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-4xl">{currentCard.word}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showAnswer ? (
                <div className="text-center py-12">
                  <Button
                    size="lg"
                    onClick={() => setShowAnswer(true)}
                    className="min-w-[200px]"
                  >
                    Show Answer
                  </Button>
                </div>
              ) : (
                <>
                  {/* Answer */}
                  <div className="space-y-4">
                    {currentCard.translation && (
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-lg text-center">{currentCard.translation}</p>
                      </div>
                    )}

                    {currentCard.definition && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-center italic">{currentCard.definition}</p>
                      </div>
                    )}

                    {currentCard.exampleSentence && (
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-center">{currentCard.exampleSentence}</p>
                      </div>
                    )}
                  </div>

                  {/* Quality Rating */}
                  <div className="space-y-4">
                    <p className="text-center font-semibold">How well did you remember?</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                        onClick={() => handleQualityRating(0)}
                        disabled={submitReviewMutation.isPending}
                      >
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-xs">Complete blackout</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                        onClick={() => handleQualityRating(2)}
                        disabled={submitReviewMutation.isPending}
                      >
                        <RotateCcw className="h-5 w-5 text-orange-500" />
                        <span className="text-xs">Hard</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                        onClick={() => handleQualityRating(3)}
                        disabled={submitReviewMutation.isPending}
                      >
                        <span className="text-lg">😐</span>
                        <span className="text-xs">Good</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                        onClick={() => handleQualityRating(4)}
                        disabled={submitReviewMutation.isPending}
                      >
                        <span className="text-lg">😊</span>
                        <span className="text-xs">Easy</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2 md:col-span-2"
                        onClick={() => handleQualityRating(5)}
                        disabled={submitReviewMutation.isPending}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-xs">Perfect</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">{currentCard.correctCount}</p>
              <p>Correct</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">{currentCard.incorrectCount}</p>
              <p>Incorrect</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">{currentCard.repetitions || 0}</p>
              <p>Reviews</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
