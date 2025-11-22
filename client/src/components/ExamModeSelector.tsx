import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, BookOpen, Target } from "lucide-react";

interface ExamModeSelectorProps {
  questionCount: number;
  timeLimitMinutes: number;
  onModeSelected: (mode: "practice" | "exam") => void;
}

export default function ExamModeSelector({ 
  questionCount, 
  timeLimitMinutes, 
  onModeSelected 
}: ExamModeSelectorProps) {
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<"practice" | "exam">("practice");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-bg">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl mb-2">{t.chooseMode}</CardTitle>
          <CardDescription>
            {questionCount} {t.questions} • {timeLimitMinutes} {t.minutesRemaining}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedMode}
            onValueChange={(value) => setSelectedMode(value as "practice" | "exam")}
            className="space-y-4"
          >
            {/* Practice Mode */}
            <Label
              htmlFor="practice"
              className={`flex items-start gap-4 p-4 sm:p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMode === "practice"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="practice" id="practice" className="mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{t.practiceMode}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.practiceModeDesc}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded">
                    ✓ {t.noTimeLimit}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded">
                    ✓ {t.pauseTimer}
                  </span>
                </div>
              </div>
            </Label>

            {/* Exam Mode */}
            <Label
              htmlFor="exam"
              className={`flex items-start gap-4 p-4 sm:p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMode === "exam"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="exam" id="exam" className="mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{t.examMode}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.examModeDesc}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {timeLimitMinutes} {t.minutesRemaining}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded">
                    ✓ {t.officialExamFormat}
                  </span>
                </div>
              </div>
            </Label>
          </RadioGroup>

          <Button
            onClick={() => onModeSelected(selectedMode)}
            className="w-full"
            size="lg"
          >
            {t.startExam}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
