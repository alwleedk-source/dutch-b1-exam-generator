import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Pause, Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExamTimerProps {
  mode: "practice" | "exam";
  timeLimitMinutes: number;
  onTimeUp?: () => void;
}

export default function ExamTimer({ mode, timeLimitMinutes, onTimeUp }: ExamTimerProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60); // in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate percentage for progress bar
  const percentage = (timeLeft / (timeLimitMinutes * 60)) * 100;

  // Determine color based on time left
  const getColor = () => {
    if (timeLeft <= 300) return "text-red-600 dark:text-red-400"; // 5 minutes
    if (timeLeft <= 600) return "text-orange-600 dark:text-orange-400"; // 10 minutes
    return "text-green-600 dark:text-green-400";
  };

  const getProgressColor = () => {
    if (timeLeft <= 300) return "bg-red-500";
    if (timeLeft <= 600) return "bg-orange-500";
    return "bg-green-500";
  };

  // Timer countdown
  useEffect(() => {
    if (mode === "practice" || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          toast.error(t.timeUp);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isPaused, timeLeft, onTimeUp, t]);

  // Warning at 5 minutes
  useEffect(() => {
    if (!hasWarned && timeLeft <= 300 && timeLeft > 0 && mode === "exam") {
      setHasWarned(true);
      toast.warning(t.timeWarning, {
        duration: 5000,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }
  }, [timeLeft, hasWarned, mode, t]);

  const togglePause = useCallback(() => {
    if (mode === "exam") return; // Cannot pause in exam mode
    setIsPaused((prev) => !prev);
    toast.info(isPaused ? t.timerStarted : t.timerPaused);
  }, [mode, isPaused, t]);

  // Practice mode - no timer
  if (mode === "practice") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>{t.practiceMode}</span>
      </div>
    );
  }

  // Exam mode - countdown timer
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${getColor()}`} />
          <div>
            <div className={`text-lg sm:text-xl font-bold ${getColor()}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.timeRemaining}
            </div>
          </div>
        </div>

        {/* Pause button only shown in practice mode - but we return early for practice mode above */}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
