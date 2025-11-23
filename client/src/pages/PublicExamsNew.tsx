import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingStars } from "@/components/RatingStars";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Users, TrendingUp, Clock, Play, Star, Filter } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function PublicExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [generatingExamId, setGeneratingExamId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'popular'>('date');
  const [minRating, setMinRating] = useState<number>(0);

  const { data: texts, isLoading } = trpc.rating.getTextsWithRatings.useQuery({
    sortBy,
    minRating: minRating > 0 ? minRating : undefined,
    limit: 50,
  });
  
  const generateExamMutation = trpc.exam.generateExam.useMutation({
    onSuccess: (data) => {
      // Redirect immediately without showing toast (faster UX)
      setLocation(`/exam/${data.examId}`);
    },
    onError: (error) => {
      toast.error("Failed to generate exam: " + error.message);
      setGeneratingExamId(null);
    },
  });
  
  const handleStartExam = (textId: number) => {
    setGeneratingExamId(textId);
    generateExamMutation.mutate({ text_id: textId });
  };

  if (!user) {
    return <NotAuthenticatedPage message="Please log in to view public exams" />;
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{t.publicExams}</h2>
            <p className="text-muted-foreground">
              {t.allExams}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Min Rating:</span>
              <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Ratings</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {texts && texts.length > 0 && (
              <div className="ml-auto text-sm text-muted-foreground">
                {texts.length} exam{texts.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          ) : !texts || texts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {minRating > 0 ? "No exams match your filters" : t.noExamsYet}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {minRating > 0 
                    ? "Try adjusting your filters to see more exams" 
                    : t.createFirstExam
                  }
                </p>
                {minRating > 0 ? (
                  <Button onClick={() => setMinRating(0)}>Clear Filters</Button>
                ) : (
                  <Link href="/create-exam">
                    <Button>{t.createFirstExam}</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {texts.map((text: any) => {
                const isHighlyRated = text.average_rating >= 4.5 && text.total_ratings >= 3;
                const isPopular = text.total_ratings >= 10;
                
                return (
                  <Card key={text.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">
                              {text.title || `Text #${text.id}`}
                            </CardTitle>
                            {isHighlyRated && (
                              <Badge variant="default" className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                            {isPopular && (
                              <Badge variant="secondary">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span>{text.word_count} {t.words}</span>
                            <span>•</span>
                            <span>{text.estimated_reading_minutes} {t.minRead}</span>
                            {text.creator_name && (
                              <>
                                <span>•</span>
                                <span>by {text.creator_name}</span>
                              </>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          {text.is_b1_level && (
                            <Badge variant="default">B1 {t.levelDetected || "Level"}</Badge>
                          )}
                          {text.detected_level && (
                            <Badge variant="outline">{text.detected_level}</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Rating Display */}
                      {text.total_ratings > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <RatingStars 
                            rating={text.average_rating || 0} 
                            totalRatings={text.total_ratings}
                            size="md"
                          />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Text Preview */}
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {text.dutch_text?.substring(0, 200)}...
                        </p>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full" 
                        onClick={() => handleStartExam(text.id)}
                        disabled={generatingExamId === text.id}
                      >
                        {generatingExamId === text.id ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            {t.generatingExam || "Generating exam..."}
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            {t.startExam || "Start Exam"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
