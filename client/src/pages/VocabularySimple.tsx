import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Volume2, Trash2, Search, ArrowLeft
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VocabularySimple() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Filter vocabulary
  const filteredVocabulary = useMemo(() => {
    if (!vocabulary) return [];

    let filtered = vocabulary.filter(word => word.status !== 'archived');

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(word =>
        word.word.toLowerCase().includes(query) ||
        getTranslation(word).toLowerCase().includes(query)
      );
    }

    // Sort alphabetically
    filtered.sort((a, b) => a.word.localeCompare(b.word));

    return filtered;
  }, [vocabulary, searchQuery, preferredLanguage]);

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

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/vocabulary">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h2 className="text-2xl sm:text-3xl font-bold">{t.simpleReview || "Simple Review"}</h2>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchWord}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stats */}
            <p className="text-sm text-muted-foreground">
              {filteredVocabulary.length} {t.words || "words"}
            </p>
          </div>

          {/* Vocabulary Table */}
          {!vocabulary || vocabulary.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-xl font-semibold mb-2">{t.noVocabularyYet}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.completeExamsToStart}
                </p>
                <Link href="/create-exam">
                  <Button>{t.createFirstExam}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : filteredVocabulary.length === 0 ? (
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
            <Card>
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">{t.dutchText || "Dutch"}</TableHead>
                        <TableHead className="w-[50%]">{t.translation || "Translation"}</TableHead>
                        <TableHead className="w-[10%] text-center">{t.listen || "Listen"}</TableHead>
                        <TableHead className="w-[10%] text-center">{t.delete || "Delete"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVocabulary.map((word: any) => {
                        const translation = getTranslation(word);
                        return (
                          <TableRow key={word.id}>
                            <TableCell className="font-medium">{word.word}</TableCell>
                            <TableCell className="text-muted-foreground">{translation}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePlayAudio(word)}
                                disabled={playingId === word.id}
                              >
                                {playingId === word.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm(t.confirmDelete || "Are you sure you want to delete this word?")) {
                                    deleteVocabMutation.mutate({ userVocabId: word.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile List */}
                <div className="sm:hidden divide-y">
                  {filteredVocabulary.map((word: any) => {
                    const translation = getTranslation(word);
                    return (
                      <div key={word.id} className="p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-base mb-1 break-words">{word.word}</div>
                          <div className="text-sm text-muted-foreground break-words">{translation}</div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handlePlayAudio(word)}
                            disabled={playingId === word.id}
                          >
                            {playingId === word.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => {
                              if (confirm(t.confirmDelete || "Are you sure?")) {
                                deleteVocabMutation.mutate({ userVocabId: word.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
