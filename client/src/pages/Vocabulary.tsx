import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function Vocabulary() {
  const { user } = useAuth();
  const { data: words } = trpc.vocabulary.getMyVocabularyProgress.useQuery(undefined, { enabled: !!user });
  
  return (
    <div className="min-h-screen p-8 bg-gradient-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Vocabulary</h1>
        <div className="grid gap-4">
          {words?.map((word: any) => (
            <Card key={word.id}>
              <CardHeader><CardTitle>{word.word}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{word.translation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}