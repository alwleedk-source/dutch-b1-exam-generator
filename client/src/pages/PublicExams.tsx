import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingStars } from "@/components/RatingStars";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Users, TrendingUp, Clock, Play, Star, Filter, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import React, { useState, useMemo } from "react";

export default function PublicExams() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [generatingExamId, setGeneratingExamId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'popular'>('date');
  const [minRating, setMinRating] = useState<number>(0);
  const [reasonFilter, setReasonFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: allTexts, isLoading } = trpc.text.listPublicTexts.useQuery(
    reasonFilter && reasonFilter !== "all" ? { reason: reasonFilter } : undefined
  );
  
  // Apply client-side filtering and sorting
  const texts = useMemo(() => {
    if (!allTexts) return [];
    
    let filtered = [...allTexts];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title?.toLowerCase().includes(query)
      );
    }
    
    // Filter by minimum rating
    if (minRating > 0) {
      filtered = filtered.filter(t => (t.average_rating || 0) >= minRating);
    }
    
    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => {
        const ratingDiff = (b.average_rating || 0) - (a.average_rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.total_ratings || 0) - (a.total_ratings || 0);
      });
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => {
        const popularityDiff = (b.total_ratings || 0) - (a.total_ratings || 0);
        if (popularityDiff !== 0) return popularityDiff;
        return (b.average_rating || 0) - (a.average_rating || 0);
      });
    } else {
      // date - already sorted by created_at DESC from server
    }
    
    return filtered;
  }, [allTexts, minRating, sortBy, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(texts.length / itemsPerPage);
  const paginatedTexts = texts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, minRating, reasonFilter, searchQuery]);
  
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

          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.searchTexts || "Search for text..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.sortBy || 'Sort by'}:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t.newestFirst || 'Newest First'}</SelectItem>
                  <SelectItem value="rating">{t.highestRated || 'Highest Rated'}</SelectItem>
                  <SelectItem value="popular">{t.mostPopular || 'Most Popular'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.minRating || 'Min Rating'}:</span>
              <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t.allRatings || 'All Ratings'}</SelectItem>
                  <SelectItem value="3">{t.threeStarsPlus || '3+ Stars'}</SelectItem>
                  <SelectItem value="4">{t.fourStarsPlus || '4+ Stars'}</SelectItem>
                  <SelectItem value="4.5">{t.fourHalfStarsPlus || '4.5+ Stars'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.filterByReason || 'Filter by Reason'}:</span>
              <Select value={reasonFilter || undefined} onValueChange={(value) => setReasonFilter(value || "")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t.allReasons || 'All Reasons'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allReasons || 'All Reasons'}</SelectItem>
                  <SelectItem value="helpful">{t.reasonHelpful}</SelectItem>
                  <SelectItem value="clear">{t.reasonClear}</SelectItem>
                  <SelectItem value="good_level">{t.reasonGoodLevel}</SelectItem>
                  <SelectItem value="real_exam">{t.reasonRealExam}</SelectItem>
                  <SelectItem value="good_practice">{t.reasonGoodPractice}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {texts && texts.length > 0 && (
              <div className="ml-auto text-sm text-muted-foreground">
                {texts.length} {texts.length === 1 ? (t.exam || 'exam') : (t.exams || 'exams')} {t.found || 'found'}
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
                  {minRating > 0 ? (t.noExamsMatchFilters || "No exams match your filters") : t.noExamsYet}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {minRating > 0 
                    ? (t.tryAdjustingFilters || "Try adjusting your filters to see more exams") 
                    : t.createFirstExam
                  }
                </p>
                {minRating > 0 ? (
                  <Button onClick={() => setMinRating(0)}>{t.clearFilters || 'Clear Filters'}</Button>
                ) : (
                  <Link href="/create-exam">
                    <Button>{t.createFirstExam}</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 mb-6">
                {paginatedTexts.map((text: any) => {
                const isHighlyRated = text.average_rating >= 4.5 && text.total_ratings >= 3;
                const isPopular = text.total_ratings >= 10;
                
                return (
                  <Card key={text.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col gap-3">
                        {/* Level badges above title */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {text.is_b1_level && (
                            <Badge variant="default" className="whitespace-nowrap">B1 {t.levelDetected || "Level"}</Badge>
                          )}
                          {text.detected_level && (
                            <Badge variant="outline" className="whitespace-nowrap">{text.detected_level}</Badge>
                          )}
                        </div>
                        
                        {/* Title - full width */}
                        <div>
                          <CardTitle className="text-lg sm:text-xl break-words">
                            {text.title || `Text #${text.id}`}
                          </CardTitle>
                        </div>
                        
                        {/* Quality badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {isHighlyRated && (
                            <Badge variant="default" className="bg-yellow-500">
                              <Star className="h-3 w-3 mr-1" />
                              {t.recommended || 'Recommended'}
                            </Badge>
                          )}
                          {isPopular && (
                            <Badge variant="secondary">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {t.popular || 'Popular'}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Meta info */}
                        <CardDescription className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                          <span className="whitespace-nowrap">{text.word_count} {t.words}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="whitespace-nowrap">{text.estimated_reading_minutes} {t.minRead}</span>
                          {text.creator_name && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{t.by || 'by'} {text.creator_name}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      
                      {/* Rating Display */}
                      {text.total_ratings > 0 && (
                        <div className="mt-2 pt-3 border-t">
                          <RatingStars 
                            rating={text.average_rating || 0} 
                            totalRatings={text.total_ratings}
                            size="sm"
                          />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Text Preview */}
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {(() => {
                            // Use dutch_text if available, otherwise strip HTML from formatted_html
                            const plainText = text.dutch_text || 
                              (text.formatted_html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
                            return plainText?.substring(0, 200) + '...';
                          })()}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    {t.previousPage || 'Previous'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t.page || 'Page'} {currentPage} {t.of || 'of'} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {t.nextPage || 'Next'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
