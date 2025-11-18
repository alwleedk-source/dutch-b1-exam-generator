import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function TakeExam() {
  const { user } = useAuth();
  const params = useParams();
  const examId = params.id ? parseInt(params.id) : null;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const { data: exam } = trpc.exam.getExamDetails.useQuery({ examId: examId! }, { enabled: !!examId });
  
  if (!exam) return <div className="p-8">Loading...</div>;
  
  const questions = JSON.parse(exam.questions as string);
  
  return (
    <div className="min-h-screen p-8 bg-gradient-bg">
      <Card className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Question {currentQ + 1} of {questions.length}</h2>
        <p className="mb-4">{questions[currentQ]?.question}</p>
        <div className="space-y-2">
          {questions[currentQ]?.options.map((opt: string, i: number) => (
            <Button 
              key={i} 
              variant={answers[currentQ] === opt ? "default" : "outline"}
              className="w-full justify-start" 
              onClick={() => setAnswers({...answers, [currentQ]: opt})}
            >
              {opt}
            </Button>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>Previous</Button>
          <Button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}>Next</Button>
        </div>
      </Card>
    </div>
  );
}
