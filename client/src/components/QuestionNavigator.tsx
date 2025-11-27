import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  totalQuestions: number;
  answers: Record<number, string>;
  currentQuestion: number;
  onQuestionClick: (index: number) => void;
}

export function QuestionNavigator({
  totalQuestions,
  answers,
  currentQuestion,
  onQuestionClick,
}: QuestionNavigatorProps) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed left-4 top-24 hidden lg:block w-20 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
      <div className="bg-sidebar dark:bg-card border border-sidebar-border dark:border-border rounded-xl p-3 shadow-lg">
        {/* Progress indicator */}
        <div className="text-xs text-center mb-3 font-medium text-muted-foreground">
          {answeredCount}/{totalQuestions}
        </div>
        
        {/* Question numbers */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const isAnswered = answers[index] !== undefined;
            const isCurrent = currentQuestion === index;
            
            return (
              <button
                key={index}
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "relative w-12 h-12 rounded-lg font-semibold text-sm transition-all duration-200",
                  "hover:scale-105 hover:ring-2 hover:ring-primary/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary",
                  // Current question (active)
                  isCurrent && "bg-primary text-primary-foreground shadow-md",
                  // Answered but not current
                  !isCurrent && isAnswered && "bg-secondary/20 text-secondary border border-secondary/30",
                  // Unanswered and not current
                  !isCurrent && !isAnswered && "bg-muted text-muted-foreground border border-border"
                )}
                aria-label={`Go to question ${index + 1}`}
                title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}`}
              >
                {index + 1}
                
                {/* Check mark for answered questions (not current) */}
                {isAnswered && !isCurrent && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white rounded-full w-4 h-4 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
