import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Volume2, Star, CheckCircle, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Link } from "wouter";

export default function Vocabulary() {
  const { user } = useAuth();
  const [playingId, setPlayingId] = useState<number | null>(null);

  const { data: vocabulary, isLoading, refetch } = trpc.vocabulary.getMyVocabularyProgress.useQuery(
    undefined,
    { enabled: !!user }
  );

  const generateAudioMutation = trpc.vocabulary.generateAudio.useMutation({
    onSuccess: (data, variables) => {
      toast.success("Audio generated!");
      // Play audio
      const audio = new Audio(data.audioUrl);
      audio.play();
      audio.onended = () => setPlayingId(null);
      // Refetch to update audioUrl in UI
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to generate audio: " + error.message);
      setPlayingId(null);
    },
  });

  const handlePlayAudio = (word: any) => {
    if (playingId === word.id) return; // Already playing

    setPlayingId(word.id);

    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl);
      audio.play();
      audio.onended = () => setPlayingId(null);
    } else {
      generateAudioMutation.mutate({ vocabId: word.id, word: word.word });
    }
  };

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">Your Vocabulary</h2>
            <p className="text-muted-foreground">
              {vocabulary?.length || 0} words learned
            </p>
          </div>

          {/* Vocabulary List */}
          {!vocabulary || vocabulary.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No vocabulary yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete exams to start building your vocabulary
                </p>
                <Link href="/create-exam">
                  <Button>Create Your First Exam</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {vocabulary.map((word: any) => (
                <Card key={word.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{word.word}</h3>
                          {word.mastered && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Mastered
                            </Badge>
                          )}
                        </div>

                        {word.translation && (
                          <p className="text-muted-foreground mb-3">{word.translation}</p>
                        )}

                        {word.definition && (
                          <p className="text-sm text-muted-foreground italic mb-3">
                            {word.definition}
                          </p>
                        )}

                        {word.exampleSentence && (
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm">{word.exampleSentence}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePlayAudio(word)}
                          disabled={playingId === word.id || generateAudioMutation.isPending}
                        >
                          {playingId === word.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>

                        {word.practiceCount > 0 && (
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span>{word.practiceCount}</span>
                            </div>
                          </div>
                        )}
                      </div>
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
