import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2, BookmarkPlus, Languages, StickyNote, Eye, EyeOff } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function StudyMode() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showTranslation, setShowTranslation] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"ar" | "en" | "tr">("en");

  const textId = id ? parseInt(id) : undefined;

  const { data: text, isLoading } = trpc.text.getTextById.useQuery(
    { text_id: textId! },
    { enabled: !!textId && !!user }
  );

  const { data: vocabulary } = trpc.vocabulary.getVocabularyByText.useQuery(
    { text_id: textId! },
    { enabled: !!textId && !!user }
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to use Study Mode</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!text) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Text Not Found</CardTitle>
            <CardDescription>The requested text could not be found</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const highlightVocabulary = (text: string) => {
    if (!vocabulary || vocabulary.length === 0) return text;

    let highlightedText = text;
    vocabulary.forEach((word: any) => {
      const regex = new RegExp(`\\b${word.word}\\b`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">${word.word}</mark>`
      );
    });

    return highlightedText;
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold gradient-text">Dutch B1</h1>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Study Mode</h2>
                <p className="text-muted-foreground">{text.title || `Text #${text.id}`}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranslation(!showTranslation)}
                >
                  {showTranslation ? (
                    <><EyeOff className="h-4 w-4 mr-2" />Hide Translation</>
                  ) : (
                    <><Eye className="h-4 w-4 mr-2" />Show Translation</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Text Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dutch Text */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Dutch Text</CardTitle>
                    <Badge variant="outline">
                      {text.wordCount} words · {text.estimatedReadingMinutes} min read
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-lg max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightVocabulary(text.dutchText) }}
                  />
                </CardContent>
              </Card>

              {/* Translation */}
              {showTranslation && false && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Translation
                      </CardTitle>
                      <Tabs value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as any)}>
                        <TabsList>
                          <TabsTrigger value="ar">🇸🇦 AR</TabsTrigger>
                          <TabsTrigger value="en">🇬🇧 EN</TabsTrigger>
                          <TabsTrigger value="tr">🇹🇷 TR</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      Translation feature coming soon
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Your Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write your notes here..."
                    className="min-h-[150px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Button
                    className="mt-4"
                    onClick={() => {
                      // Save notes (implement later)
                      toast.success("Notes saved!");
                    }}
                  >
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Vocabulary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Key Vocabulary
                  </CardTitle>
                  <CardDescription>
                    {vocabulary?.length || 0} words highlighted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vocabulary && vocabulary.length > 0 ? (
                    <div className="space-y-3">
                      {vocabulary.slice(0, 10).map((word: any) => (
                        <div key={word.id} className="p-3 rounded-lg bg-muted">
                          <h4 className="font-semibold mb-1">{word.word}</h4>
                          {word.translation && (
                            <p className="text-sm text-muted-foreground">{word.translation}</p>
                          )}
                        </div>
                      ))}
                      {vocabulary.length > 10 && (
                        <Link href="/vocabulary">
                          <Button variant="outline" className="w-full">
                            View All Vocabulary
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No vocabulary extracted yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/exam/${textId}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Take Exam
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Bookmark Text
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
