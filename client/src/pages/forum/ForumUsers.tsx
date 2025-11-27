import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Ban, CheckCircle, AlertTriangle, Search, User } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

export default function ForumUsers() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [userToUnban, setUserToUnban] = useState<number | null>(null);
  const [userContentUserId, setUserContentUserId] = useState<number | null>(null);
  
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.forum.getAllUsers.useQuery({ search, limit: 100 });
  const { data: userContent } = trpc.forum.getUserContent.useQuery(
    { userId: userContentUserId! },
    { enabled: !!userContentUserId }
  );
  
  const unbanUserMutation = trpc.forum.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("User unbanned successfully");
      utils.forum.getAllUsers.invalidate();
      setUserToUnban(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-muted-foreground">Admin access required</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  const filteredUsers = users?.filter(u => 
    !search || 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/forum/moderator">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Moderator Panel
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">User Management</CardTitle>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !filteredUsers || filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <Card key={u.id} className={u.is_banned ? "border-destructive" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{u.name || "Unknown"}</span>
                            {u.role === "admin" && (
                              <Badge variant="default">Admin</Badge>
                            )}
                            {u.role === "moderator" && (
                              <Badge variant="secondary">Moderator</Badge>
                            )}
                            {u.is_banned && (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {u.created_at && formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                          </p>
                          
                          {u.is_banned && u.ban_reason && (
                            <p className="text-sm text-destructive mt-2">
                              <span className="font-medium">Ban reason:</span> {u.ban_reason}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserContentUserId(u.id)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            View Content
                          </Button>
                          
                          {u.is_banned ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setUserToUnban(u.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            u.role !== "admin" && (
                              <Link href="/forum/reports">
                                <Button variant="ghost" size="sm">
                                  <Ban className="h-4 w-4 mr-1" />
                                  Ban
                                </Button>
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Unban Confirmation Dialog */}
      <Dialog open={!!userToUnban} onOpenChange={(open) => !open && setUserToUnban(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>Are you sure you want to unban this user?</DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUserToUnban(null)}>Cancel</Button>
            <Button
              variant="default"
              onClick={() => unbanUserMutation.mutate({ userId: userToUnban! })}
              disabled={unbanUserMutation.isPending}
            >
              Confirm Unban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Content Dialog (reused from ForumReports) */}
      <Dialog open={!!userContentUserId} onOpenChange={(open) => !open && setUserContentUserId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Content</DialogTitle>
            <DialogDescription>All topics and posts by this user</DialogDescription>
          </DialogHeader>
          
          {userContent && (
            <div className="space-y-4">
              {/* Topics */}
              <div>
                <h3 className="font-semibold mb-2">Topics ({userContent.topics.length})</h3>
                {userContent.topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topics</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userContent.topics.map((topic) => (
                      <Card key={topic.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{topic.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {topic.reply_count} replies • {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Posts */}
              <div>
                <h3 className="font-semibold mb-2">Posts ({userContent.posts.length})</h3>
                {userContent.posts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userContent.posts.slice(0, 20).map((post) => (
                      <Card key={post.id}>
                        <CardContent className="pt-4">
                          <div 
                            className="text-sm prose prose-sm dark:prose-invert max-w-none line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                    {userContent.posts.length > 20 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing 20 of {userContent.posts.length} posts
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
