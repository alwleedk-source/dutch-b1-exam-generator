import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ForumEditor } from "@/components/ForumEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { truncateName } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { ArrowLeft, ThumbsUp, ThumbsDown, Send, Edit, Trash2, Pin, Lock, EyeOff, Flag } from "lucide-react";
import { Link, useParams } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export default function ForumTopic() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const topicId = parseInt(id || "0");
  const [replyContent, setReplyContent] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportContentType, setReportContentType] = useState<"topic" | "post">("topic");
  const [reportContentId, setReportContentId] = useState<number>(0);
  const [reportReason, setReportReason] = useState<string>("");
  
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.forum.getTopic.useQuery({
    topicId,
    page: 1,
    limit: 20,
  });
  
  const createPostMutation = trpc.forum.createPost.useMutation({
    onSuccess: () => {
      toast.success(t.replyPosted || "Reply posted successfully!");
      setReplyContent("");
      utils.forum.getTopic.invalidate({ topicId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const voteMutation = trpc.forum.vote.useMutation({
    onSuccess: () => {
      utils.forum.getTopic.invalidate({ topicId });
    },
  });
  
  const deleteTopicMutation = trpc.forum.deleteTopic.useMutation({
    onSuccess: () => {
      toast.success(t.topicDeleted || "Topic deleted successfully");
      window.location.href = "/forum";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deletePostMutation = trpc.forum.deletePost.useMutation({
    onSuccess: () => {
      toast.success(t.postDeleted || "Post deleted successfully");
      utils.forum.getTopic.invalidate({ topicId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const togglePinMutation = trpc.forum.togglePinTopic.useMutation({
    onSuccess: () => {
      toast.success(t.topicPinToggled || "Topic pin toggled");
      utils.forum.getTopic.invalidate({ topicId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const toggleLockMutation = trpc.forum.toggleLockTopic.useMutation({
    onSuccess: () => {
      toast.success(t.topicLockToggled || "Topic lock toggled");
      utils.forum.getTopic.invalidate({ topicId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const toggleHideMutation = trpc.forum.toggleHideTopic.useMutation({
    onSuccess: () => {
      toast.success(t.topicHideToggled || "Topic visibility toggled");
      utils.forum.getTopic.invalidate({ topicId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const reportMutation = trpc.forum.reportContent.useMutation({
    onSuccess: () => {
      toast.success(t.reportSubmitted || "Report submitted successfully");
      setReportDialogOpen(false);
      setReportReason("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const canEditOrDelete = (createdAt: string, userId: number) => {
    if (!user) return false;
    if (user.role === "moderator" || user.role === "admin") return true;
    if (user.id !== userId) return false;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(createdAt) > fiveMinutesAgo;
  };
  
  const isModerator = user && (user.role === "moderator" || user.role === "admin");
  
  const handleReportClick = (contentType: "topic" | "post", contentId: number) => {
    setReportContentType(contentType);
    setReportContentId(contentId);
    setReportDialogOpen(true);
  };
  
  const handleReportSubmit = () => {
    if (!reportReason) {
      toast.error(t.selectReportReason || "Please select a reason");
      return;
    }
    
    reportMutation.mutate({
      topicId: reportContentType === "topic" ? reportContentId : undefined,
      postId: reportContentType === "post" ? reportContentId : undefined,
      reason: reportReason,
    });
  };

  const handleReply = () => {
    if (!replyContent.trim()) {
      toast.error(t.replyCannotBeEmpty || "Reply cannot be empty");
      return;
    }
    
    createPostMutation.mutate({
      topicId,
      content: replyContent,
    });
  };

  const handleVote = (voteType: "upvote" | "downvote", postId?: number) => {
    voteMutation.mutate({
      topicId: postId ? undefined : topicId,
      postId,
      voteType,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="skeleton h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <p>{t.topicNotFound || "Topic not found"}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <Link href="/forum">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToForum || "Back to Forum"}
          </Button>
        </Link>

        {/* Topic */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-start gap-2 mb-4 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold break-words flex-1">{data.topic.title}</h1>
              {data.topic.is_hidden && (
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  <EyeOff className="h-3 w-3 mr-1" />
                  {t.hidden || "Hidden"}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-4">
              <UserAvatar name={data.topic.user_name} size="sm" />
              <span title={data.topic.user_name || "Unknown"}>{truncateName(data.topic.user_name)}</span>
              <span>•</span>
              <span className="text-xs sm:text-sm">
                {data.topic.created_at && formatDistanceToNow(new Date(data.topic.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <div 
              className="prose prose-sm sm:prose dark:prose-invert max-w-none mb-4 break-words"
              dangerouslySetInnerHTML={{ __html: data.topic.content }}
            />
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote("upvote")}
                disabled={!user}
                className="text-xs sm:text-sm"
              >
                <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {data.topic.upvote_count}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote("downvote")}
                disabled={!user}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportClick("topic", data.topic.id)}
                  className="text-xs sm:text-sm"
                >
                  <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">{t.report || "Report"}</span>
                </Button>
              )}
              
              {canEditOrDelete(data.topic.created_at, data.topic.user_id) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm(t.confirmDelete || "Are you sure you want to delete this topic?")) {
                      deleteTopicMutation.mutate({ topicId });
                    }
                  }}
                  disabled={deleteTopicMutation.isPending}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">{t.delete}</span>
                </Button>
              )}
              
              {isModerator && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePinMutation.mutate({ topicId })}
                    disabled={togglePinMutation.isPending}
                    className={`text-xs sm:text-sm ${data.topic.is_pinned ? 'bg-primary/10' : ''}`}
                  >
                    <Pin className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{data.topic.is_pinned ? (t.unpin || "Unpin") : (t.pin || "Pin")}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLockMutation.mutate({ topicId })}
                    disabled={toggleLockMutation.isPending}
                    className={`text-xs sm:text-sm ${data.topic.is_locked ? 'bg-destructive/10' : ''}`}
                  >
                    <Lock className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{data.topic.is_locked ? (t.unlock || "Unlock") : (t.lock || "Lock")}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleHideMutation.mutate({ topicId })}
                    disabled={toggleHideMutation.isPending}
                    className="text-xs sm:text-sm"
                  >
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{data.topic.is_hidden ? (t.unhide || "Unhide") : (t.hide || "Hide")}</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">
            {t.replies || "Replies"} ({data.posts.length})
          </h2>
          
          {data.posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
                  <UserAvatar name={post.user_name} size="sm" />
                  <span className="font-medium" title={post.user_name || "Unknown"}>{truncateName(post.user_name)}</span>
                  <span>•</span>
                  <span className="text-xs sm:text-sm">
                    {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div 
                  className="prose prose-sm sm:prose dark:prose-invert max-w-none mb-3 break-words"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote("upvote", post.id)}
                    disabled={!user}
                    className="text-xs sm:text-sm"
                  >
                    <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {post.upvote_count}
                  </Button>
                  
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReportClick("post", post.id)}
                      className="text-xs sm:text-sm"
                    >
                      <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline">{t.report || "Report"}</span>
                    </Button>
                  )}
                  
                  {canEditOrDelete(post.created_at, post.user_id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(t.confirmDelete || "Are you sure you want to delete this post?")) {
                          deletePostMutation.mutate({ postId: post.id });
                        }
                      }}
                      disabled={deletePostMutation.isPending}
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline">{t.delete}</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {user ? (
          <Card>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">
                {t.postReply || "Post a Reply"}
              </h3>
              
              <ForumEditor
                value={replyContent}
                onChange={setReplyContent}
                placeholder={t.writeYourReply || "Write your reply..."}
                className="mb-4"
              />
              
              <Button
                onClick={handleReply}
                disabled={createPostMutation.isPending || !replyContent.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {createPostMutation.isPending ? t.posting || "Posting..." : t.postReply || "Post Reply"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                {t.loginToReply || "Please log in to reply"}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.reportContent || "Report Content"}</DialogTitle>
            <DialogDescription>
              {t.reportDescription || "Please select a reason for reporting this content."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>{t.reason || "Reason"}</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectReason || "Select a reason"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">{t.spam || "Spam"}</SelectItem>
                  <SelectItem value="harassment">{t.harassment || "Harassment"}</SelectItem>
                  <SelectItem value="inappropriate">{t.inappropriate || "Inappropriate Content"}</SelectItem>
                  <SelectItem value="misinformation">{t.misinformation || "Misinformation"}</SelectItem>
                  <SelectItem value="other">{t.other || "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              {t.cancel || "Cancel"}
            </Button>
            <Button onClick={handleReportSubmit} disabled={reportMutation.isPending}>
              {t.submit || "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
