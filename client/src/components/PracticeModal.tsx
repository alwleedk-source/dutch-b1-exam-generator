import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, SkipForward, Archive, Headphones, RotateCw } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

interface PracticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wordId?: number;
  specificWordId?: number; // Alias for wordId
  onComplete: () => void;
}

type PracticeMode = "flashcard" | "multiple-choice" | "reverse-choice" | "listening";

export function PracticeModal({ open, onOpenChange, wordId, specificWordId, onComplete }: PracticeModalProps) {
  // Use either wordId or specificWordId
  const effectiveWordId = wordId ?? specificWordId;
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<PracticeMode>("flashcard");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [choices, setChoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  // New: Swipe gesture state
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Get all user vocabulary
  const { data: allVocabulary } = trpc.vocabulary.getMyVocabularyProgress.useQuery(
    undefined,
    { enabled: open }
  );

  const updateProgressMutation = trpc.vocabulary.updatePracticeProgress.useMutation({
    onSuccess: () => {
      // Silently update - no toast
    },
  });

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

  const archiveVocabMutation = trpc.vocabulary.archiveUserVocabulary.useMutation({
    onSuccess: () => {
      toast.success(t.wordArchived || "Word archived");
      // Move to next word after archiving
      if (currentIndex < words.length - 1) {
        handleNext();
      } else {
        onComplete();
      }
    },
    onError: (error) => {
      toast.error("Failed to archive: " + error.message);
    },
  });

  // Filter to get practice words (start with selected word if provided)
  const words = allVocabulary || [];
  const currentWord = words[currentIndex];

  // Initialize current index based on wordId
  useEffect(() => {
    if (effectiveWordId && words.length > 0) {
      const index = words.findIndex((w: any) => w.id === effectiveWordId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [effectiveWordId, words]);

  // Generate multiple choice options when mode changes or word changes
  useEffect(() => {
    if ((mode === "multiple-choice" || mode === "reverse-choice" || mode === "listening") && currentWord && words.length >= 4) {
      generateChoices();
    }
  }, [mode, currentIndex, words]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setStats({ correct: 0, incorrect: 0 });
      setCurrentIndex(0);
      resetCard();
    }
  }, [open]);

  const generateChoices = () => {
    if (!currentWord || words.length < 4) return;

    // Get 3 random wrong answers
    const wrongChoices = words
      .filter((w: any) => w.id !== currentWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine with correct answer and shuffle
    const allChoices = [currentWord, ...wrongChoices].sort(() => Math.random() - 0.5);
    setChoices(allChoices);
  };

  const handlePlayAudio = async () => {
    if (!currentWord || playingAudio) return;

    setPlayingAudio(true);

    if (currentWord.audioUrl) {
      // Play existing audio
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
      // Generate audio if not available
      generateAudioMutation.mutate({
        vocabId: currentWord.vocabulary_id || currentWord.vocabularyId,
        word: currentWord.word
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetCard();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetCard();
    }
  };

  const resetCard = () => {
    setShowAnswer(false);
    setSelectedChoice(null);
    setSwipeDirection(null);
    setIsFlipped(false);
  };

  const handleFlashcardRating = async (isCorrect: boolean) => {
    if (!currentWord) return;

    // Update stats
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));

    // Update SRS
    try {
      await updateProgressMutation.mutateAsync({
        userVocabId: currentWord.id,
        isCorrect,
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }

    // Move to next card
    if (currentIndex < words.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 300);
    } else {
      // Show completion
      const finalCorrect = stats.correct + (isCorrect ? 1 : 0);
      const finalIncorrect = stats.incorrect + (isCorrect ? 0 : 1);
      toast.success(`${t.practiceComplete || "Practice complete"}! ✓${finalCorrect} ✗${finalIncorrect}`);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleChoiceSelect = async (choice: any) => {
    if (selectedChoice !== null) return; // Already answered

    setSelectedChoice(choice.id);
    const correct = choice.id === currentWord.id;

    // Update stats
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    // Update SRS
    try {
      await updateProgressMutation.mutateAsync({
        userVocabId: currentWord.id,
        isCorrect: correct,
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
    }

    // Move to next after delay
    if (currentIndex < words.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      // Show completion
      const finalCorrect = stats.correct + (correct ? 1 : 0);
      const finalIncorrect = stats.incorrect + (correct ? 0 : 1);
      setTimeout(() => {
        toast.success(`${t.practiceComplete || "Practice complete"}! ✓${finalCorrect} ✗${finalIncorrect}`);
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 1500);
    }
  };

  const getTranslation = (word: any) => {
    if (!word) return "";

    // Get translation based on user's preferred language
    switch (language) {
      case "ar":
        return word.arabicTranslation || word.translation;
      case "en":
        return word.englishTranslation || word.translation;
      case "tr":
        return word.turkishTranslation || word.translation;
      case "nl":
        return word.dutchDefinition || word.translation;
      default:
        return word.translation;
    }
  };

  if (!currentWord) return null;

  const currentTranslation = getTranslation(currentWord);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t.practice}</DialogTitle>
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-600 font-medium">✓ {stats.correct}</span>
                <span className="text-red-600 font-medium">✗ {stats.incorrect}</span>
              </div>
              {/* Mode Toggle */}
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={mode === "flashcard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("flashcard");
                    resetCard();
                  }}
                  title="Flashcards"
                >
                  🎴
                </Button>
                <Button
                  variant={mode === "multiple-choice" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("multiple-choice");
                    resetCard();
                  }}
                  disabled={words.length < 4}
                  title={t.multipleChoice || "Multiple Choice"}
                >
                  🔤
                </Button>
                <Button
                  variant={mode === "reverse-choice" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("reverse-choice");
                    resetCard();
                  }}
                  disabled={words.length < 4}
                  title={t.reverseQuiz || "Reverse Quiz"}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant={mode === "listening" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMode("listening");
                    resetCard();
                  }}
                  disabled={words.length < 4}
                  title={t.listeningQuiz || "Listening Quiz"}
                >
                  <Headphones className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{currentIndex + 1} / {words.length}</span>
          <div className="flex-1 mx-4 bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard Mode */}
        {mode === "flashcard" && (
          <div className="space-y-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all min-h-[300px] flex items-center justify-center"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <CardContent className="p-8 text-center">
                {!showAnswer ? (
                  <div>
                    <h2 className="text-4xl font-bold mb-4">{currentWord.word}</h2>
                    {currentWord.dutchDefinition && (
                      <p className="text-muted-foreground text-lg italic mb-6">{currentWord.dutchDefinition}</p>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio();
                      }}
                      disabled={playingAudio}
                    >
                      <Volume2 className="h-5 w-5 mr-2" />
                      {t.listen || "Listen"}
                    </Button>
                    <p className="text-muted-foreground text-sm mt-6">
                      {t.clickToReveal || "Click to reveal answer"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-4xl font-bold mb-2">{currentWord.word}</h2>
                    <p className="text-3xl text-primary mb-6">{currentTranslation}</p>
                    {currentWord.dutchDefinition && (
                      <p className="text-muted-foreground text-lg italic mb-8">{currentWord.dutchDefinition}</p>
                    )}
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-3">{t.howWellRemembered || "How well did you remember?"}</p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          className="flex-1 border-red-300 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlashcardRating(false);
                          }}
                        >
                          {t.incorrect || "Incorrect"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-green-300 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlashcardRating(true);
                          }}
                        >
                          {t.correct || "Correct"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="space-y-2">
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
                  onClick={resetCard}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t.reset || "Reset"}
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

              {/* Skip and Archive Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleNext}
                  disabled={currentIndex === words.length - 1}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  {t.skip || "Skip"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => {
                    if (confirm(t.confirmArchive || "Archive this word? It won't appear in practice often.")) {
                      archiveVocabMutation.mutate({ userVocabId: currentWord.id });
                    }
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {t.dontShowAgain || "Don't show again"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Choice Mode */}
        {mode === "multiple-choice" && choices.length === 4 && (
          <div className="space-y-6">
            <Card className="min-h-[200px] flex items-center justify-center">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">{currentWord.word}</h2>
                {currentWord.dutchDefinition && (
                  <p className="text-muted-foreground text-lg italic mb-4">{currentWord.dutchDefinition}</p>
                )}
                <Button
                  variant="outline"
                  onClick={handlePlayAudio}
                  disabled={playingAudio}
                >
                  <Volume2 className="h-5 w-5 mr-2" />
                  {t.listen || "Listen"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <p className="text-center text-muted-foreground mb-4">
                {t.selectCorrectTranslation || "Select the correct translation:"}
              </p>
              {choices.map((choice) => {
                const isSelected = selectedChoice === choice.id;
                const isCorrectChoice = choice.id === currentWord.id;
                const showResult = selectedChoice !== null;

                let buttonClass = "";
                if (showResult) {
                  if (isCorrectChoice) {
                    buttonClass = "border-green-500 bg-green-50 text-green-900";
                  } else if (isSelected) {
                    buttonClass = "border-red-500 bg-red-50 text-red-900";
                  }
                }

                return (
                  <Button
                    key={choice.id}
                    variant="outline"
                    className={`w-full text-lg py-6 ${buttonClass}`}
                    onClick={() => handleChoiceSelect(choice)}
                    disabled={selectedChoice !== null}
                  >
                    {getTranslation(choice)}
                    {showResult && isCorrectChoice && " ✓"}
                    {showResult && isSelected && !isCorrectChoice && " ✗"}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reverse Choice Mode - Show translation, pick Dutch word */}
        {mode === "reverse-choice" && choices.length === 4 && (
          <div className="space-y-6">
            <Card className="min-h-[200px] flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
              <CardContent className="p-8 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  {t.whichDutchWord || "Which Dutch word means:"}
                </div>
                <h2 className="text-3xl font-bold mb-4">{currentTranslation}</h2>
                {currentWord.dutchDefinition && (
                  <p className="text-muted-foreground text-lg italic mb-4">{currentWord.dutchDefinition}</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <p className="text-center text-muted-foreground mb-4">
                {t.selectCorrectDutchWord || "Select the correct Dutch word:"}
              </p>
              {choices.map((choice) => {
                const isSelected = selectedChoice === choice.id;
                const isCorrectChoice = choice.id === currentWord.id;
                const showResult = selectedChoice !== null;

                let buttonClass = "";
                if (showResult) {
                  if (isCorrectChoice) {
                    buttonClass = "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100";
                  } else if (isSelected) {
                    buttonClass = "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100";
                  }
                }

                return (
                  <Button
                    key={choice.id}
                    variant="outline"
                    className={`w-full text-lg py-6 ${buttonClass}`}
                    onClick={() => handleChoiceSelect(choice)}
                    disabled={selectedChoice !== null}
                  >
                    {choice.word}
                    {showResult && isCorrectChoice && " ✓"}
                    {showResult && isSelected && !isCorrectChoice && " ✗"}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Listening Mode - Hear word, select translation */}
        {mode === "listening" && choices.length === 4 && (
          <div className="space-y-6">
            <Card className="min-h-[200px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-8 text-center">
                <div className="text-sm text-muted-foreground mb-4">
                  {t.listenAndChoose || "Listen to the word and choose the correct translation:"}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePlayAudio}
                  disabled={playingAudio}
                  className={`h-20 w-20 rounded-full ${playingAudio ? 'listening-pulse' : ''}`}
                >
                  <Volume2 className="h-10 w-10" />
                </Button>
                <p className="text-muted-foreground text-sm mt-4">
                  {playingAudio ? (t.playing || "Playing...") : (t.clickToListen || "Click to listen")}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {choices.map((choice) => {
                const isSelected = selectedChoice === choice.id;
                const isCorrectChoice = choice.id === currentWord.id;
                const showResult = selectedChoice !== null;

                let buttonClass = "";
                if (showResult) {
                  if (isCorrectChoice) {
                    buttonClass = "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100";
                  } else if (isSelected) {
                    buttonClass = "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100";
                  }
                }

                return (
                  <Button
                    key={choice.id}
                    variant="outline"
                    className={`w-full text-lg py-6 ${buttonClass}`}
                    onClick={() => handleChoiceSelect(choice)}
                    disabled={selectedChoice !== null}
                  >
                    {getTranslation(choice)}
                    {showResult && isCorrectChoice && " ✓"}
                    {showResult && isSelected && !isCorrectChoice && " ✗"}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
