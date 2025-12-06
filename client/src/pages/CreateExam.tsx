import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { NotAuthenticatedPage } from "@/components/NotAuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Loader2, CheckCircle, AlertCircle, Sparkles, Upload, Image as ImageIcon, AlertTriangle, X, Lightbulb } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cleanPastedText, formatDutchText, countWords, estimateReadingTime, isTextLongEnough } from "@/lib/textCleaner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CreateExam() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  // Check if exam creation is enabled
  const { data: examCreationStatus } = trpc.settings.isExamCreationEnabled.useQuery();

  const [dutchText, setDutchText] = useState("");
  const [title, setTitle] = useState("");
  const [textId, setTextId] = useState<number | null>(null);
  const [step, setStep] = useState<"input" | "validating" | "validated" | "generating">("input");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [processingSteps, setProcessingSteps] = useState<Array<{
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
  }>>([]);
  const [validation, setValidation] = useState<any>(null);
  const [agreedToPublic, setAgreedToPublic] = useState(false);
  const [similarTexts, setSimilarTexts] = useState<Array<{ id: number; title: string; similarity: number }>>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [suggestionTopic, setSuggestionTopic] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractFromImageMutation = trpc.text.extractFromImage.useMutation({
    onSuccess: (data) => {
      setDutchText(data.text);
      setIsExtracting(false);
      toast.success(`Text extracted! ${data.characterCount} characters${data.isTruncated ? ' (truncated to 10,100)' : ''}`);

      // Check for duplicates after extraction
      checkDuplicateMutation.mutate({ text: data.text });
    },
    onError: (error) => {
      setIsExtracting(false);
      toast.error("Failed to extract text: " + error.message);
    },
  });

  const checkDuplicateMutation = trpc.text.checkDuplicate.useMutation({
    onSuccess: (data) => {
      if (data.isDuplicate) {
        setSimilarTexts(data.similarTexts);
        toast.warning(`Found ${data.similarTexts.length} similar text(s)`);
      } else {
        setSimilarTexts([]);
      }
    },
    onError: (error) => {
      console.error("Duplicate check failed:", error);
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleImagePaste = (file: File) => {
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }

    setIsExtracting(true);
    toast.info("Extracting text from pasted image...");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      extractFromImageMutation.mutate({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleTextChange = (text: string) => {
    setDutchText(text);

    // Check for duplicates when text changes (debounced)
    if (text.length > 100) {
      checkDuplicateMutation.mutate({ text });
    } else {
      setSimilarTexts([]);
    }
  };

  const createTextMutation = trpc.text.create.useMutation({
    onMutate: () => {
      setStep("generating");

      // Initialize processing steps
      const steps = [
        { id: 'clean', label: t.stepCleanText, status: 'processing' as const },
        { id: 'title', label: t.stepGenerateTitle, status: 'pending' as const },
        { id: 'questions', label: t.stepCreateQuestions, status: 'pending' as const },
        { id: 'vocabulary', label: t.stepExtractVocabulary, status: 'pending' as const },
        { id: 'format', label: t.stepFormatText, status: 'pending' as const },
      ];
      setProcessingSteps(steps);

      // Simulate step progression (since we use unified call, we estimate timing)
      setTimeout(() => {
        setProcessingSteps(prev => prev.map((s, i) =>
          i === 0 ? { ...s, status: 'completed' } :
            i === 1 ? { ...s, status: 'processing' } : s
        ));
      }, 2000);

      setTimeout(() => {
        setProcessingSteps(prev => prev.map((s, i) =>
          i <= 1 ? { ...s, status: 'completed' } :
            i === 2 ? { ...s, status: 'processing' } : s
        ));
      }, 4000);

      setTimeout(() => {
        setProcessingSteps(prev => prev.map((s, i) =>
          i <= 2 ? { ...s, status: 'completed' } :
            i === 3 ? { ...s, status: 'processing' } : s
        ));
      }, 7000);

      setTimeout(() => {
        setProcessingSteps(prev => prev.map((s, i) =>
          i <= 3 ? { ...s, status: 'completed' } :
            i === 4 ? { ...s, status: 'processing' } : s
        ));
      }, 9000);
    },
    onSuccess: (data) => {
      // New flow: text.create now returns exam_id and questions directly
      setTextId(data.text_id);
      setLoadingMessage(t.success || "Success!");
      toast.success(t.examCreatedSuccessfully || "Exam created successfully!");
      // Redirect to exam page after short delay
      setTimeout(() => {
        window.location.href = `/exam/${data.exam_id}`;
      }, 500);
    },
    onError: (error) => {
      toast.error(t.failedToCreateExam + ": " + error.message);
      setStep("input");
      setLoadingMessage("");
    },
  });

  const validateTextMutation = trpc.text.validateText.useMutation({
    onSuccess: (data) => {
      setValidation(data);
      setStep("validated");
      if (!data.is_valid_dutch) {
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
      // Redirect immediately without showing toast (faster UX)
      setLocation(`/exam/${data.examId}`);
    },
    onError: (error) => {
      toast.error("Failed to generate exam: " + error.message);
      setStep("validated");
    },
  });

  const suggestTopicMutation = trpc.text.suggestTopic.useMutation({
    onSuccess: () => {
      toast.success(t.suggestionSubmitted || "Suggestion submitted!");
      setIsSuggestionOpen(false);
      setSuggestionTopic("");
    },
    onError: (error) => {
      toast.error((t.suggestionFailed || "Failed to submit suggestion") + ": " + error.message);
    },
  });

  const handleSuggestTopic = () => {
    if (!suggestionTopic.trim()) return;
    suggestTopicMutation.mutate({ topic: suggestionTopic });
  };

  const handleSubmit = () => {
    if (!dutchText.trim()) {
      toast.error("Please enter Dutch text");
      return;
    }

    if (dutchText.length < 100) {
      toast.error("Text too short (minimum 100 characters)");
      return;
    }

    if (dutchText.length > 10100) {
      toast.error("Text too long (maximum 10,100 characters)");
      return;
    }

    if (!agreedToPublic) {
      toast.error("Please agree to make the text public");
      return;
    }

    createTextMutation.mutate({
      dutch_text: dutchText,
      title: title || undefined,
      source: "paste",
    });
  };

  const handleGenerateExam = () => {
    if (!textId) return;
    setStep("generating");
    generateExamMutation.mutate({ text_id: textId });
  };

  if (!user) {
    return <NotAuthenticatedPage message="Please log in to create exams" />;
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <AppHeader />

      {/* Exam Creation Disabled Overlay */}
      {examCreationStatus && !examCreationStatus.enabled && user?.role !== 'admin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setLocation("/dashboard")}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl">
                {t.examCreationDisabledTitle}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {t.examCreationDisabledMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setLocation("/public-exams")}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {t.browseExams}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSuggestionOpen(true)}
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                {t.suggestTopic || "Suggest Missing Topic"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setLocation("/dashboard")}
              >
                {t.backToDashboard}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isSuggestionOpen} onOpenChange={setIsSuggestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.suggestTopic || "Suggest Missing Topic"}</DialogTitle>
            <DialogDescription>
              {t.topicSuggestionPlaceholder || "Describe the topic you would like to see added..."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={suggestionTopic}
              onChange={(e) => setSuggestionTopic(e.target.value)}
              placeholder={t.topicSuggestionPlaceholder || "Describe the topic..."}
              maxLength={70}
            />
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {suggestionTopic.length}/70
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuggestionOpen(false)}>
              {t.cancel || "Cancel"}
            </Button>
            <Button
              onClick={handleSuggestTopic}
              disabled={!suggestionTopic.trim() || suggestTopicMutation.isPending}
            >
              {suggestTopicMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.submitSuggestion || "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create New Exam</h2>
            <p className="text-muted-foreground">
              Add a Dutch B1 text to generate comprehension questions
            </p>
          </div>

          {step === "input" && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Add Dutch Text</CardTitle>
                <CardDescription>
                  Paste text or upload an image (OCR). Maximum 10,100 characters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="e.g., De Nederlandse cultuur"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/255 characters
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Upload Image (OCR)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting text...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Upload Image to Extract Text
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Supported: JPG, PNG, WebP (max 10MB)
                  </p>
                </div>

                {/* Text Input - Rich Text Editor */}
                <div className="space-y-2">
                  <Label htmlFor="text" className="text-lg font-semibold">Dutch Text</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Paste text from Word, Google Docs, or type directly. Formatting will be cleaned automatically.
                  </p>
                  <RichTextEditor
                    value={dutchText}
                    onChange={handleTextChange}
                    placeholder={t.pasteOrTypeDutchText}
                    onImagePaste={handleImagePaste}
                  />
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
                    <div className="flex justify-between">
                      <span>{countWords(dutchText)} words • {estimateReadingTime(dutchText)} min read</span>
                      <span className={dutchText.length > 10100 ? 'text-red-500 font-semibold' : ''}>
                        {dutchText.length} / 10,100 characters
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <span className={dutchText.length > 10100 ? 'text-red-500 font-semibold' : dutchText.length > 9000 ? 'text-orange-500' : 'text-green-600'}>
                        {t.remaining || "Remaining"}: {(10100 - dutchText.length).toLocaleString()} {t.characters || "characters"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Similar Texts Warning */}
                {similarTexts.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-2">Similar texts found:</p>
                      <ul className="space-y-1">
                        {similarTexts.map((text) => (
                          <li key={text.id}>
                            <Link href={`/study/${text.id}`}>
                              <a className="underline hover:text-primary">
                                {text.title} ({text.similarity}% similar)
                              </a>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm">
                        You can still add this text, but consider using an existing one.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Public Agreement */}
                <div className="flex items-start space-x-2 p-4 border rounded-lg bg-muted/50">
                  <Checkbox
                    id="agree"
                    checked={agreedToPublic}
                    onCheckedChange={(checked) => setAgreedToPublic(checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="agree"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I agree to make this text public
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      All texts are shared with the community to help everyone learn Dutch.
                      By submitting, you confirm you have the right to share this content.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={createTextMutation.isPending || !agreedToPublic}
                >
                  {createTextMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Validate & Create Exam
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "validating" && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Validating Text...</h3>
                <p className="text-muted-foreground">
                  Checking language and CEFR level with AI
                </p>
              </CardContent>
            </Card>
          )}

          {step === "validated" && validation && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {validation.is_valid_dutch ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-semibold">
                    {validation.is_valid_dutch ? "Valid Dutch text" : "Not Dutch text"}
                  </span>
                </div>

                {validation.detectedLevel && (
                  <div>
                    <p className="text-sm text-muted-foreground">Detected Level:</p>
                    <p className="text-lg font-semibold">{validation.detectedLevel}</p>
                  </div>
                )}

                {validation.warning && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validation.warning}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("input")}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleGenerateExam}
                    disabled={!validation.is_valid_dutch}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "generating" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  {t.processingWithAI}
                </CardTitle>
                <CardDescription>
                  {t.processingWithGemini}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 py-8">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{t.progressLabel}</span>
                    <span className="font-semibold text-primary">
                      {Math.round((processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                      style={{
                        width: `${(processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="space-y-4">
                  {processingSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 p-4 rounded-lg border transition-all duration-300"
                      style={{
                        backgroundColor: step.status === 'completed' ? 'hsl(var(--primary) / 0.1)' :
                          step.status === 'processing' ? 'hsl(var(--primary) / 0.05)' :
                            'transparent',
                        borderColor: step.status === 'completed' ? 'hsl(var(--primary) / 0.3)' :
                          step.status === 'processing' ? 'hsl(var(--primary) / 0.2)' :
                            'hsl(var(--border))',
                      }}
                    >
                      {/* Step Icon */}
                      <div className="flex-shrink-0">
                        {step.status === 'completed' && (
                          <CheckCircle className="h-6 w-6 text-primary" />
                        )}
                        {step.status === 'processing' && (
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        )}
                        {step.status === 'pending' && (
                          <div className="h-6 w-6 rounded-full border-2 border-muted" />
                        )}
                        {step.status === 'error' && (
                          <AlertCircle className="h-6 w-6 text-destructive" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium" style={{
                            color: step.status === 'completed' ? 'hsl(var(--primary))' :
                              step.status === 'processing' ? 'hsl(var(--foreground))' :
                                'hsl(var(--muted-foreground))'
                          }}>
                            {step.label}
                          </span>
                          {step.status === 'processing' && (
                            <span className="text-xs text-primary animate-pulse">
                              {t.processingStatus}
                            </span>
                          )}
                          {step.status === 'completed' && (
                            <span className="text-xs text-primary">
                              {t.completedStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info Message */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">{t.unifiedProcessing}</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        {t.unifiedProcessingDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
