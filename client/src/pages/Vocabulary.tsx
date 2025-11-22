import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, Volume2, Star, CheckCircle, BookOpen, 
  Search, Filter, ArrowUpDown, Grid3x3, List,
  Play, Trophy, Trash2, Archive, ArchiveRestore, Award
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { PracticeModal } from "@/components/PracticeModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'learning' | 'mastered' | 'due' | 'archived';
type SortMode = 'alphabetical' | 'mastery' | 'date' | 'next-review';

export default function Vocabulary() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [practiceWordId, setPracticeWordId] = useState<number | undefined>();
  
  // Get user's preferred language
  const preferredLanguage = user?.preferred_language || localStorage.getItem('preferredLanguage') || 'en';

  const { data: vocabulary, isLoading, refetch } = trpc.vocabulary.getMyVocabularyProgress.useQuery(
    undefined,
    { enabled: !!user }
  );

  const generateAudioMutation = trpc.vocabulary.generateAudio.useMutation({
    onSuccess: (data) => {
      const audio = new Audio(data.audioUrl);
      audio.play();
      audio.onended = () => setPlayingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to generate audio: " + error.message);
      setPlayingId(null);
    },
  });

  const deleteVocabMutation = trpc.vocabulary.deleteUserVocabulary.useMutation({
    onSuccess: () => {
      toast.success(t.wordDeleted || "Word deleted");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  const archiveVocabMutation = trpc.vocabulary.archiveUserVocabulary.useMutation({
    onSuccess: () => {
      toast.success(t.wordArchived || "Word archived");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to archive: " + error.message);
    },
  });

  const unarchiveVocabMutation = trpc.vocabulary.unarchiveUserVocabulary.useMutation({
    onSuccess: () => {
      toast.success(t.wordUnarchived || "Word restored");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to restore: " + error.message);
    },
  });

  const markAsMasteredMutation = trpc.vocabulary.markAsMastered.useMutation({
    onSuccess: () => {
      toast.success(t.markedAsMastered || "Marked as mastered");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to mark as mastered: " + error.message);
    },
  });

  const handlePlayAudio = (word: any) => {
    if (playingId === word.id) return;

    setPlayingId(word.id);

    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play();
      audio.onended = () => setPlayingId(null);
    } else {
      generateAudioMutation.mutate({ vocabId: word.id, word: word.word });
    }
  };

  // Get translation based on user's preferred language
  const getTranslation = (word: any) => {
    switch (preferredLanguage) {
      case 'ar':
        return word.arabicTranslation || word.englishTranslation || word.turkishTranslation;
      case 'en':
        return word.englishTranslation || word.arabicTranslation || word.turkishTranslation;
      case 'tr':
        return word.turkishTranslation || word.englishTranslation || word.arabicTranslation;
      case 'nl':
        return word.definition;
      default:
        return word.englishTranslation || word.arabicTranslation || word.turkishTranslation;
    }
  };

  // Calculate mastery percentage
  const getMasteryPercentage = (word: any) => {
    const total = word.correctCount + word.incorrectCount;
    if (total === 0) return 0;
    return Math.round((word.correctCount / total) * 100);
  };

  // Check if word is due for review
  const isDue = (word: any) => {
    if (!word.nextReviewAt) return false;
    return new Date(word.nextReviewAt) <= new Date();
  };

  // Filter and sort vocabulary
  const filteredAndSortedVocabulary = useMemo(() => {
    if (!vocabulary) return [];

    let filtered = [...vocabulary];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(word =>
        word.word.toLowerCase().includes(query) ||
        getTranslation(word).toLowerCase().includes(query)
      );
    }

    // Apply status filter
    switch (filterMode) {
      case 'learning':
        filtered = filtered.filter(word => 
          word.status !== 'archived' && (word.status === 'learning' || getMasteryPercentage(word) < 80)
        );
        break;
      case 'mastered':
        filtered = filtered.filter(word => 
          word.status !== 'archived' && (word.status === 'mastered' || getMasteryPercentage(word) >= 80)
        );
        break;
      case 'due':
        filtered = filtered.filter(word => word.status !== 'archived' && isDue(word));
        break;
      case 'archived':
        filtered = filtered.filter(word => word.status === 'archived');
        break;
      case 'all':
      default:
        // Exclude archived from 'all' view
        filtered = filtered.filter(word => word.status !== 'archived');
        break;
    }

    // Apply sorting
    switch (sortMode) {
      case 'alphabetical':
        filtered.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case 'mastery':
        filtered.sort((a, b) => getMasteryPercentage(b) - getMasteryPercentage(a));
        break;
      case 'date':
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'next-review':
        filtered.sort((a, b) => {
          if (!a.nextReviewAt) return 1;
          if (!b.nextReviewAt) return -1;
          return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
        });
        break;
    }

    return filtered;
  }, [vocabulary, searchQuery, filterMode, sortMode, preferredLanguage]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!vocabulary) return { total: 0, mastered: 0, learning: 0, due: 0 };
    
    return {
      total: vocabulary.length,
      mastered: vocabulary.filter(w => getMasteryPercentage(w) >= 80).length,
      learning: vocabulary.filter(w => getMasteryPercentage(w) < 80).length,
      due: vocabulary.filter(w => isDue(w)).length,
    };
  }, [vocabulary]);

  if (!user) {
    return <NotAuthenticatedPage message="Please log in to view your vocabulary" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Stats */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">{t.yourVocabulary}</h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">{t.wordsLearned}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
                  <div className="text-sm text-muted-foreground">{t.vocabMastered}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.learning}</div>
                  <div className="text-sm text-muted-foreground">{t.vocabLearning}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.due}</div>
                  <div className="text-sm text-muted-foreground">{t.vocabDue}</div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchWord}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter */}
              <Select value={filterMode} onValueChange={(value: FilterMode) => setFilterMode(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.filterAll}</SelectItem>
                  <SelectItem value="learning">{t.filterLearning}</SelectItem>
                  <SelectItem value="mastered">{t.filterMastered}</SelectItem>
                  <SelectItem value="due">{t.filterDue}</SelectItem>
                  <SelectItem value="archived">{t.filterArchived || "Archived"}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t.sortNewest}</SelectItem>
                  <SelectItem value="alphabetical">{t.sortAlphabetical}</SelectItem>
                  <SelectItem value="mastery">{t.sortMastery}</SelectItem>
                  <SelectItem value="next-review">{t.sortNextReview}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Vocabulary List */}
          {!vocabulary || vocabulary.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">{t.noVocabularyYet}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.completeExamsToStart}
                </p>
                <Link href="/create-exam">
                  <Button>{t.createFirstExam}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : filteredAndSortedVocabulary.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">{t.noResults}</h3>
                <p className="text-muted-foreground">
                  {t.tryDifferentFilter}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "grid gap-3"
            }>
              {filteredAndSortedVocabulary.map((word: any) => {
                const masteryPercentage = getMasteryPercentage(word);
                const translation = getTranslation(word);
                const isWordDue = isDue(word);

                return (
                  <Card 
                    key={word.id} 
                    className={`hover:border-primary/50 transition-all ${
                      isWordDue ? 'border-orange-500/50 shadow-orange-100' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{word.word}</h3>
                            {masteryPercentage >= 80 && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {isWordDue && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                                {t.vocabDue}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{translation}</p>
                          {word.definition && (
                            <p className="text-xs text-muted-foreground/70 italic mt-1">{word.definition}</p>
                          )}
                        </div>

                        {/* Audio Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePlayAudio(word)}
                          disabled={playingId === word.id}
                        >
                          {playingId === word.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{t.masteryLevel}</span>
                          <span className="text-xs font-medium">{masteryPercentage}%</span>
                        </div>
                        <Progress 
                          value={masteryPercentage} 
                          className="h-2"
                        />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {word.correctCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-red-600">✗</span>
                            {word.incorrectCount}
                          </span>
                        </div>
                        {word.repetitions > 0 && (
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-yellow-600" />
                            {word.repetitions}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {/* Practice Button */}
                        {word.status !== 'archived' && (
                          <Button 
                            className="w-full" 
                            size="sm"
                            variant={isWordDue ? "default" : "outline"}
                            onClick={() => {
                              setPracticeWordId(word.id);
                              setPracticeModalOpen(true);
                            }}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isWordDue ? t.reviewNow : t.practice}
                          </Button>
                        )}

                        {/* Management Buttons */}
                        <div className="flex gap-2">
                          {word.status === 'archived' ? (
                            <Button
                              className="flex-1"
                              size="sm"
                              variant="outline"
                              onClick={() => unarchiveVocabMutation.mutate({ userVocabId: word.id })}
                            >
                              <ArchiveRestore className="h-3 w-3 mr-1" />
                              {t.restore || "Restore"}
                            </Button>
                          ) : (
                            <>
                              {word.status !== 'mastered' && (
                                <Button
                                  className="flex-1"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsMasteredMutation.mutate({ userVocabId: word.id })}
                                  title={t.markAsMastered || "Mark as mastered"}
                                >
                                  <Award className="h-3 w-3 mr-1" />
                                  {t.mastered || "Mastered"}
                                </Button>
                              )}
                              <Button
                                className="flex-1"
                                size="sm"
                                variant="outline"
                                onClick={() => archiveVocabMutation.mutate({ userVocabId: word.id })}
                                title={t.archive || "Archive"}
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                {t.archive || "Archive"}
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(t.confirmDelete || "Are you sure you want to delete this word?")) {
                                deleteVocabMutation.mutate({ userVocabId: word.id });
                              }
                            }}
                            title={t.delete || "Delete"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Practice Modal */}
      <PracticeModal
        open={practiceModalOpen}
        onOpenChange={setPracticeModalOpen}
        wordId={practiceWordId}
        onComplete={() => {
          refetch();
          setPracticeModalOpen(false);
        }}
      />
    </div>
  );
}
