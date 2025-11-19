import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Loader2, CheckCircle, AlertCircle, Sparkles, Upload, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { cleanPastedText, formatDutchText, countWords, estimateReadingTime, isTextLongEnough } from "@/lib/textCleaner";

export default function CreateExam() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  const [dutchText, setDutchText] = useState("");
  const [title, setTitle] = useState("");
  const [textId, setTextId] = useState<number | null>(null);
  const [step, setStep] = useState<"input" | "validating" | "validated" | "generating">("input");
  const [validation, setValidation] = useState<any>(null);
  const [agreedToPublic, setAgreedToPublic] = useState(false);
  const [similarTexts, setSimilarTexts] = useState<Array<{ id: number; title: string; similarity: number }>>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractFromImageMutation = trpc.text.extractFromImage.useMutation({
    onSuccess: (data) => {
      setDutchText(data.text);
      setIsExtracting(false);
      toast.success(`Text extracted! ${data.characterCount} characters${data.isTruncated ? ' (truncated to 5000)' : ''}`);
      
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
    onSuccess: (data) => {
      setTextId(data.text_id);
      setStep("validating");
      validateTextMutation.mutate({ text_id: data.text_id });
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
      toast.error("Please enter Dutch text");
      return;
    }

    if (dutchText.length < 100) {
      toast.error("Text too short (minimum 100 characters)");
      return;
    }

    if (dutchText.length > 5000) {
      toast.error("Text too long (maximum 5000 characters)");
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please log in to create exams</CardDescription>
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
            
            <nav className="flex items-center gap-2">
              <Link href="/create-exam">
                <Button variant="ghost" size="sm">{t.createNewExam || "Create Exam"}</Button>
              </Link>
              <Link href="/my-exams">
                <Button variant="ghost" size="sm">{t.myExams}</Button>
              </Link>
              <Link href="/public-exams">
                <Button variant="ghost" size="sm">{t.publicExams}</Button>
              </Link>
              <Link href="/progress">
                <Button variant="ghost" size="sm">{t.progress || "Progress"}</Button>
              </Link>
              <Link href="/vocabulary">
                <Button variant="ghost" size="sm">{t.vocabulary || "Vocabulary"}</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t.logout || "Logout"}
              </Button>
            </nav>
          </div>
        </div>
      </header>

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
                  Paste text or upload an image (OCR). Maximum 5000 characters.
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
                  />
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
                    placeholder="Plak of typ hier Nederlandse tekst... (Paste or type Dutch text here)"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{countWords(dutchText)} words • {estimateReadingTime(dutchText)} min read</span>
                    <span className={dutchText.length > 5000 ? 'text-red-500 font-semibold' : ''}>
                      {dutchText.length} / 5000 characters
                    </span>
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
              <CardContent className="py-12 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Generating Exam...</h3>
                <p className="text-muted-foreground">
                  Creating 10 comprehension questions with AI
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
