import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateExam() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const [dutchText, setDutchText] = useState("");
  const [title, setTitle] = useState("");
  const [textId, setTextId] = useState<number | null>(null);
  const [step, setStep] = useState<"input" | "validating" | "validated" | "generating">("input");
  const [validation, setValidation] = useState<any>(null);

  const createTextMutation = trpc.text.create.useMutation({
    onSuccess: (data) => {
      setTextId(data.textId);
      setStep("validating");
      validateTextMutation.mutate({ textId: data.textId });
    },
    onError: (error) => {
      toast.error("Failed to create text: " + error.message);
      setStep("input");
    },
  });

  const validateTextMutation = trpc.text.validateText.useMutation({
    onSuccess: (data) => {
      setValidation(data);
      setStep("validated");
      if (!data.isValidDutch) {
        toast.error("Text is not in Dutch language!");
      } else if (data.warning) {
        toast.warning(data.warning);
      } else {
        toast.success("Text validated successfully!");
      }
    },
    onError: (error) => {
      toast.error("Validation failed: " + error.message);
      setStep("input");
    },
  });

  const generateExamMutation = trpc.exam.generateExam.useMutation({
    onSuccess: (data) => {
      toast.success("Exam generated successfully!");
      setLocation(`/exam/${data.examId}`);
    },
    onError: (error) => {
      toast.error("Failed to generate exam: " + error.message);
      setStep("validated");
    },
  });

  const handleSubmit = () => {
    if (!dutchText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    if (dutchText.split(/\s+/).length < 50) {
      toast.error("Text must be at least 50 words");
      return;
    }

    createTextMutation.mutate({
      dutchText: dutchText.trim(),
      title: title.trim() || undefined,
      source: "paste",
    });
  };

  const handleGenerateExam = () => {
    if (!textId) return;
    setStep("generating");
    generateExamMutation.mutate({ textId });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to create an exam</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
                <Button variant="ghost">{t.dashboard}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-2">{t.createNewExam}</h2>
            <p className="text-muted-foreground">
              Add a Dutch B1 text and generate comprehension questions
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === "input" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "input" ? "border-primary bg-primary/10" : "border-muted"}`}>
                1
              </div>
              <span className="hidden sm:inline">Add Text</span>
            </div>
            <div className="w-16 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step === "validating" || step === "validated" || step === "generating" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "validating" || step === "validated" || step === "generating" ? "border-primary bg-primary/10" : "border-muted"}`}>
                2
              </div>
              <span className="hidden sm:inline">Validate</span>
            </div>
            <div className="w-16 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step === "generating" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "generating" ? "border-primary bg-primary/10" : "border-muted"}`}>
                3
              </div>
              <span className="hidden sm:inline">Generate</span>
            </div>
          </div>

          {/* Input Form */}
          {(step === "input") && (
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Enter Dutch Text</CardTitle>
                <CardDescription>
                  Paste or type a Dutch B1 level text (minimum 50 words)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Het Nederlandse klimaat"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Dutch Text *</Label>
                  <Textarea
                    id="text"
                    placeholder="Paste your Dutch B1 text here..."
                    className="min-h-[300px] font-mono"
                    value={dutchText}
                    onChange={(e) => setDutchText(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Words: {dutchText.split(/\s+/).filter(w => w).length} / 50 minimum
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createTextMutation.isPending || dutchText.split(/\s+/).filter(w => w).length < 50}
                  className="w-full gap-2"
                  size="lg"
                >
                  {createTextMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Validate & Continue
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Validating */}
          {step === "validating" && (
            <Card className="animate-scale-in">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Validating Text...</h3>
                <p className="text-muted-foreground">
                  AI is checking if the text is Dutch and determining the CEFR level
                </p>
              </CardContent>
            </Card>
          )}

          {/* Validated */}
          {step === "validated" && validation && (
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                  {validation.isValidDutch ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold mb-1">
                      {validation.isValidDutch ? "✓ Dutch Language Detected" : "✗ Not Dutch Language"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      The text appears to be {validation.isValidDutch ? "in Dutch" : "not in Dutch"}
                    </p>
                  </div>
                </div>

                {validation.isValidDutch && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                    {validation.isB1Level ? (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold mb-1">
                        CEFR Level: {validation.detectedLevel}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {validation.levelConfidence}%
                      </p>
                      {validation.warning && (
                        <p className="text-sm text-yellow-600 mt-2">
                          ⚠️ {validation.warning}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("input");
                      setTextId(null);
                      setValidation(null);
                    }}
                    className="flex-1"
                  >
                    Edit Text
                  </Button>
                  <Button
                    onClick={handleGenerateExam}
                    disabled={!validation.isValidDutch}
                    className="flex-1 gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Generate Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generating */}
          {step === "generating" && (
            <Card className="animate-scale-in">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Generating Exam Questions...</h3>
                <p className="text-muted-foreground">
                  AI is creating 10 comprehension questions based on your text
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take 10-20 seconds
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
