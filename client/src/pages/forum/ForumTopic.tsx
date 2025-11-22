import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ForumEditor } from "@/components/ForumEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ThumbsUp, ThumbsDown, Send, Edit, Trash2, Pin, Lock, EyeOff } from "lucide-react";
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
  
  const canEditOrDelete = (createdAt: string, userId: number) => {
    if (!user) return false;
    if (user.role === "moderator" || user.role === "admin") return true;
    if (user.id !== userId) return false;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(createdAt) > fiveMinutesAgo;
  };
  
  const isModerator = user && (user.role === "moderator" || user.role === "admin");

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
      
      <main className="container mx-auto px-4 py-8">
        <Link href="/forum">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToForum || "Back to Forum"}
          </Button>
        </Link>

        {/* Topic */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-4">{data.topic.title}</h1>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>by {data.topic.user_name || "Unknown"}</span>
              <span>•</span>
              <span>
                {data.topic.created_at && formatDistanceToNow(new Date(data.topic.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <div 
              className="prose dark:prose-invert max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: data.topic.content }}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote("upvote")}
                disabled={!user}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {data.topic.upvote_count}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote("downvote")}
                disabled={!user}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
              </Button>
              
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
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t.delete}
                </Button>
              )}
              
              {isModerator && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePinMutation.mutate({ topicId })}
                    disabled={togglePinMutation.isPending}
                    className={data.topic.is_pinned ? 'bg-primary/10' : ''}
                  >
                    <Pin className="h-4 w-4 mr-1" />
                    {data.topic.is_pinned ? (t.unpin || "Unpin") : (t.pin || "Pin")}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLockMutation.mutate({ topicId })}
                    disabled={toggleLockMutation.isPending}
                    className={data.topic.is_locked ? 'bg-destructive/10' : ''}
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    {data.topic.is_locked ? (t.unlock || "Unlock") : (t.lock || "Lock")}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleHideMutation.mutate({ topicId })}
                    disabled={toggleHideMutation.isPending}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    {data.topic.is_hidden ? (t.unhide || "Unhide") : (t.hide || "Hide")}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">
            {t.replies || "Replies"} ({data.posts.length})
          </h2>
          
          {data.posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="font-medium">{post.user_name || "Unknown"}</span>
                  <span>•</span>
                  <span>
                    {post.created_at && formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div 
                  className="prose dark:prose-invert max-w-none mb-3"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote("upvote", post.id)}
                    disabled={!user}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {post.upvote_count}
                  </Button>
                  
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
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t.delete}
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
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
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
    </div>
  );
}
