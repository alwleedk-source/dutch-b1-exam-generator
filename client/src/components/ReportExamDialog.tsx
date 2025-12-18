import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReportExamDialogProps {
  examId: number;
  trigger?: React.ReactNode;
}

export function ReportExamDialog({ examId, trigger }: ReportExamDialogProps) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<"text_error" | "question_error" | "answer_error" | "other">("text_error");
  const [details, setDetails] = useState("");

  const isRTL = language === "ar";

  const reportMutation = trpc.report.createReportForExam.useMutation({
    onSuccess: () => {
      toast.success(t.reportSentSuccess);
      setOpen(false);
      setDetails("");
      setReason("text_error");
    },
    onError: (error) => {
      toast.error(t.reportSendFailed + ": " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!details.trim()) {
      toast.error(t.pleaseWriteDetails);
      return;
    }

    reportMutation.mutate({
      exam_id: examId,
      reason,
      details,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t.reportProblem}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.reportProblem}</DialogTitle>
          <DialogDescription>
            {t.reportProblemDesc}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t.problemType}</Label>
            <RadioGroup value={reason} onValueChange={(value: any) => setReason(value)}>
              <div className={`flex items-center ${isRTL ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                <RadioGroupItem value="text_error" id="text_error" />
                <Label htmlFor="text_error" className="font-normal cursor-pointer">
                  {t.textError}
                </Label>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                <RadioGroupItem value="question_error" id="question_error" />
                <Label htmlFor="question_error" className="font-normal cursor-pointer">
                  {t.questionError}
                </Label>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                <RadioGroupItem value="answer_error" id="answer_error" />
                <Label htmlFor="answer_error" className="font-normal cursor-pointer">
                  {t.answerError}
                </Label>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-2 space-x-reverse' : 'space-x-2'}`}>
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  {t.somethingElse}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">{t.problemDetails}</Label>
            <Textarea
              id="details"
              placeholder={t.writeProblemDetails}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={reportMutation.isPending}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={reportMutation.isPending}>
            {reportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.sending}
              </>
            ) : (
              t.sendReport
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
