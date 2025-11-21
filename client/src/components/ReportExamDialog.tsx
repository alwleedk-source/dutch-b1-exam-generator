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

interface ReportExamDialogProps {
  examId: number;
  trigger?: React.ReactNode;
}

export function ReportExamDialog({ examId, trigger }: ReportExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<"inappropriate_content" | "spam" | "cheating" | "other">("inappropriate_content");
  const [details, setDetails] = useState("");

  const reportMutation = trpc.report.createReportForExam.useMutation({
    onSuccess: () => {
      toast.success("Report submitted successfully. Our team will review it.");
      setOpen(false);
      setDetails("");
      setReason("inappropriate_content");
    },
    onError: (error) => {
      toast.error("Failed to submit report: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!details.trim()) {
      toast.error("Please provide details about the issue");
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
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Exam</DialogTitle>
          <DialogDescription>
            Help us maintain quality by reporting inappropriate or problematic content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason for reporting</Label>
            <RadioGroup value={reason} onValueChange={(value: any) => setReason(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate_content" id="inappropriate" />
                <Label htmlFor="inappropriate" className="font-normal cursor-pointer">
                  Inappropriate or offensive content
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" />
                <Label htmlFor="spam" className="font-normal cursor-pointer">
                  Spam or misleading content
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cheating" id="cheating" />
                <Label htmlFor="cheating" className="font-normal cursor-pointer">
                  Suspected cheating or manipulation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  Other issue
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Additional details</Label>
            <Textarea
              id="details"
              placeholder="Please provide more information about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={reportMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={reportMutation.isPending}>
            {reportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
