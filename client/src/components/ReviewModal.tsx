import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Volume2, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wordId?: number;
  onComplete: () => void;
}

export function ReviewModal({ open, onOpenChange, wordId, onComplete }: ReviewModalProps) {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  const { data: allVocabulary } = trpc.vocabulary.getUserVocabularyProgress.useQuery(
    undefined,
    { enabled: open }
  );

  const generateAudioMutation = trpc.vocabulary.generateAudio.useMutation({
    onSuccess: (data) => {
      const audio = new Audio(data.audioUrl);
      audio.play();
      audio.onended = () => setPlayingAudio(false);
    },
    onError: (error) => {
      toast.error(t.audioError || "Failed to generate audio");
      setPlayingAudio(false);
    },
  });

  // Filter to get non-archived words
  const words = (allVocabulary || []).filter((w: any) => w.status !== 'archived');
  const currentWord = words[currentIndex];

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setShowDefinition(false);
      setPlayingAudio(false);
      
      // If wordId is provided, start from that word
      if (wordId && words.length > 0) {
        const index = words.findIndex((w: any) => w.id === wordId);
        if (index !== -1) {
          setCurrentIndex(index);
        }
      }
    }
  }, [open, wordId, words.length]);

  // Reset definition when moving to next/previous word
  useEffect(() => {
    setShowDefinition(false);
  }, [currentIndex]);

  const handlePlayAudio = async () => {
    if (!currentWord || playingAudio) return;

    setPlayingAudio(true);

    if (currentWord.audioUrl) {
      try {
        const audio = new Audio(currentWord.audioUrl);
        audio.onended = () => setPlayingAudio(false);
        audio.onerror = () => {
          setPlayingAudio(false);
          toast.error(t.audioError || "Failed to play audio");
        };
        await audio.play();
      } catch (error) {
        setPlayingAudio(false);
        toast.error(t.audioError || "Failed to play audio");
      }
    } else {
      generateAudioMutation.mutate({ 
        vocabId: currentWord.vocabulary_id || currentWord.vocabularyId, 
        word: currentWord.word 
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getTranslation = (word: any) => {
    switch (language) {
      case 'ar':
        return word.arabicTranslation || word.englishTranslation || '';
      case 'en':
        return word.englishTranslation || word.arabicTranslation || '';
      case 'tr':
        return word.turkishTranslation || word.englishTranslation || '';
      case 'nl':
        return word.dutchDefinition || '';
      default:
        return word.englishTranslation || '';
    }
  };

  if (!currentWord) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t.reviewMode || "Review Mode"}</span>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {words.length}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="border-2">
            <CardContent className="p-8 text-center space-y-6">
              {/* Dutch Word */}
              <div>
                <h2 className="text-4xl font-bold mb-2">{currentWord.word}</h2>
              </div>

              {/* Audio Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={handlePlayAudio}
                disabled={playingAudio}
                className="w-full sm:w-auto"
              >
                <Volume2 className="h-5 w-5 mr-2" />
                {t.listen || "Listen"}
              </Button>

              {/* Translation */}
              <div className="pt-4 border-t">
                <p className="text-2xl text-muted-foreground">
                  {getTranslation(currentWord)}
                </p>
              </div>

              {/* Show/Hide Definition Button */}
              {currentWord.dutchDefinition && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDefinition(!showDefinition)}
                    className="w-full sm:w-auto"
                  >
                    {showDefinition ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        {t.hideDefinition || "Hide Definition"}
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        {t.showDefinition || "Show Dutch Definition"}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Dutch Definition (when shown) */}
              {showDefinition && currentWord.dutchDefinition && (
                <div className="pt-4 border-t">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <p className="text-lg italic text-blue-900 dark:text-blue-100">
                      💡 {currentWord.dutchDefinition}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t.previous || "Previous"}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onComplete}
            >
              {t.close || "Close"}
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === words.length - 1}
            >
              {t.next || "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
