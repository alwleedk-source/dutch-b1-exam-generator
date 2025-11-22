import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { truncateName } from "@/lib/utils";
import { ArrowLeft, MessageSquare, Pin, Lock, ThumbsUp, Eye, Plus, EyeOff } from "lucide-react";
import { Link, useParams } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function ForumCategory() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const categoryId = parseInt(id || "0");
  
  const { data: topics, isLoading } = trpc.forum.getTopicsByCategory.useQuery({
    categoryId,
    page: 1,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/forum">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToForum || "Back to Forum"}
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {t.topics || "Topics"}
            </h1>
            
            {user && (
              <Link href={`/forum/new-topic?category=${categoryId}`}>
                <Button className="gap-2">
                  <Plus className="h-5 w-5" />
                  {t.createNewTopic || "New Topic"}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Topics List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : topics && topics.length > 0 ? (
          <div className="space-y-4">
            {topics.map((topic) => (
              <Link key={topic.id} href={`/forum/topic/${topic.id}`}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {topic.is_pinned && (
                            <Pin className="h-4 w-4 text-blue-600" />
                          )}
                          {topic.is_locked && (
                            <Lock className="h-4 w-4 text-gray-600" />
                          )}
                          {topic.is_hidden && (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                              <EyeOff className="h-3 w-3 mr-1" />
                              {t.hidden || "Hidden"}
                            </Badge>
                          )}
                          <h3 className="text-lg font-semibold hover:text-primary">
                            {topic.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span title={topic.user_name || "Unknown"}>by {truncateName(topic.user_name)}</span>
                          <span>•</span>
                          <span>
                            {topic.created_at && formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{topic.upvote_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{topic.reply_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{topic.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">
                {t.noTopicsYet || "No topics yet. Be the first to start a discussion!"}
              </p>
              {user && (
                <Link href={`/forum/new-topic?category=${categoryId}`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createFirstTopic || "Create First Topic"}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
