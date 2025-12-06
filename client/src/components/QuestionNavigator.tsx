import { useEffect, useState } from "react";
import { Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  totalQuestions: number;
  answers: Record<number, string>;
  currentQuestion: number;
  onQuestionClick: (index: number) => void;
  onBackToText: () => void;
}

export function QuestionNavigator({
  totalQuestions,
  answers,
  currentQuestion,
  onQuestionClick,
  onBackToText,
}: QuestionNavigatorProps) {
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed left-4 top-24 hidden lg:block w-20">
      <div className="bg-sidebar dark:bg-card border border-sidebar-border dark:border-border rounded-xl p-3 shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
        {/* Sticky header with text button and counter */}
        <div className="sticky top-0 z-10 bg-sidebar dark:bg-card pb-2 -mt-3 pt-3">
          {/* Back to text button */}
          <button
            onClick={onBackToText}
            className="w-full mb-2 py-2 px-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-1"
            aria-label="Back to text"
            title="Scroll back to the Dutch text"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>النص</span>
          </button>
          
          {/* Progress indicator */}
          <div className="text-xs text-center mb-1 font-medium text-muted-foreground">
            {answeredCount}/{totalQuestions}
          </div>
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
