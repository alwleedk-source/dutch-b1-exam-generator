import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/RatingStars";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || "");

  const rateTextMutation = trpc.rating.rateText.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your rating!");
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

          {/* Comment (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comment (Optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about this exam..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
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
