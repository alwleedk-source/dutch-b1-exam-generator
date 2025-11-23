import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RatingStars } from "@/components/RatingStars";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  textId: number;
  textTitle: string;
  existingRating?: { rating: number; comment?: string };
}

export function RatingDialog({ 
  open, 
  onOpenChange, 
  textId, 
  textTitle,
  existingRating 
}: RatingDialogProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState(existingRating?.comment || "");

  const rateTextMutation = trpc.rating.rateText.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your rating!");
      // Invalidate queries to refresh rating data
      queryClient.invalidateQueries({ queryKey: [['rating', 'getUserRating']] });
      queryClient.invalidateQueries({ queryKey: [['rating', 'getTextRatings']] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to submit rating: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    rateTextMutation.mutate({
      text_id: textId,
      rating,
      reason: reason || undefined,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate this Exam</DialogTitle>
          <DialogDescription>
            How would you rate "{textTitle}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex justify-center">
              <RatingStars
                rating={rating}
                size="lg"
                showCount={false}
                interactive={true}
                onRate={setRating}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Reason Selection (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.ratingReason}
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectReason} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={t.reasonHelpful}>{t.reasonHelpful}</SelectItem>
                <SelectItem value={t.reasonClear}>{t.reasonClear}</SelectItem>
                <SelectItem value={t.reasonGoodLevel}>{t.reasonGoodLevel}</SelectItem>
                <SelectItem value={t.reasonRealExam}>{t.reasonRealExam}</SelectItem>
                <SelectItem value={t.reasonGoodPractice}>{t.reasonGoodPractice}</SelectItem>
                <SelectItem value={t.reasonOther}>{t.reasonOther}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Comment (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.additionalDetails} ({t.optional})
            </label>
            <Textarea
              placeholder={t.shareThoughts}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/300
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={rating === 0 || rateTextMutation.isLoading}
          >
            {rateTextMutation.isLoading ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
