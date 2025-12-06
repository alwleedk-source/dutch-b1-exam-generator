import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Eye, Ban, Trash2, User, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

export default function ForumReports() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"pending" | "resolved" | "all">("pending");

  // Dialog states
  const [detailsReportId, setDetailsReportId] = useState<number | null>(null);
  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [banDuration, setBanDuration] = useState<"1day" | "1week" | "1month" | "permanent">("1week");
  const [banReason, setBanReason] = useState("");
  const [userContentUserId, setUserContentUserId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.forum.getReports.useQuery({ status });
  const { data: reportDetails } = trpc.forum.getReportDetails.useQuery(
    { reportId: detailsReportId! },
    { enabled: !!detailsReportId }
  );
  const { data: userContent } = trpc.forum.getUserContent.useQuery(
    { userId: userContentUserId! },
    { enabled: !!userContentUserId }
  );

  const resolveReportMutation = trpc.forum.resolveReport.useMutation({
    onSuccess: () => {
      toast.success("Report resolved");
      utils.forum.getReports.invalidate();
      setDetailsReportId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const dismissReportMutation = trpc.forum.dismissReport.useMutation({
    onSuccess: () => {
      toast.success("Report dismissed");
      utils.forum.getReports.invalidate();
      setDetailsReportId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const banUserMutation = trpc.forum.banUser.useMutation({
    onSuccess: () => {
      toast.success("User banned successfully");
      utils.forum.getReports.invalidate();
      setBanUserId(null);
      setBanReason("");
      setDetailsReportId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteContentMutation = trpc.forum.deleteContent.useMutation({
    onSuccess: () => {
      toast.success("Content deleted successfully");
      utils.forum.getReports.invalidate();
      setDetailsReportId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const bulkDeleteMutation = trpc.forum.bulkDeleteUserContent.useMutation({
    onSuccess: () => {
      toast.success("User content deleted successfully");
      setUserContentUserId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Check if user is moderator or admin
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-muted-foreground">
                {t.moderatorAccessRequired || "Moderator access required"}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      spam: "Spam",
      harassment: "Harassment",
      inappropriate: "Inappropriate content",
      misinformation: "Misinformation",
      other: "Other",
    };
    return reasons[reason] || reason;
  };

  const getDurationText = (duration: string) => {
    const durations: Record<string, string> = {
      "1day": "1 Day",
      "1week": "1 Week",
      "1month": "1 Month",
      "permanent": "Permanent",
    };
    return durations[duration] || duration;
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/forum/moderator">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Moderator Panel
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Reports Management</CardTitle>

              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !reports || reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No reports found</div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className={report.status !== "pending" ? "opacity-60" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{getReasonText(report.reason)}</span>
                            <span className={`text-xs px-2 py-1 rounded ${report.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                                : report.status === "resolved"
                                  ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                  : "bg-gray-500/20 text-gray-700 dark:text-gray-300"
                              }`}>
                              {report.status}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            Reported by: {report.reporter_name || "Unknown"}
                          </p>

                          {report.details && (
                            <p className="text-sm mb-2 text-muted-foreground italic">
                              "{report.details.substring(0, 100)}{report.details.length > 100 ? '...' : ''}"
                            </p>
                          )}

                          <div className="flex gap-2 text-sm text-muted-foreground">
                            <span>
                              {report.created_at && formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailsReportId(report.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
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

      {/* Report Details Modal */}
      <Dialog open={!!detailsReportId} onOpenChange={(open) => !open && setDetailsReportId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>Review reported content and take action</DialogDescription>
          </DialogHeader>

          {reportDetails && (
            <div className="space-y-4">
              {/* Report Info */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Report Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Reason:</span> {getReasonText(reportDetails.reason)}</p>
                  <p><span className="font-medium">Reported by:</span> {reportDetails.reporter_name}</p>
                  {reportDetails.details && (
                    <p><span className="font-medium">Details:</span> {reportDetails.details}</p>
                  )}
                  <p><span className="font-medium">Status:</span> {reportDetails.status}</p>
                </div>
              </div>

              {/* Reported Content */}
              {reportDetails.content && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 text-destructive">Reported Content</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Type:</span> {reportDetails.content.type === "topic" ? "Topic" : "Post"}</p>
                    <p className="text-sm"><span className="font-medium">Author:</span> {reportDetails.content.user_name}</p>
                    {reportDetails.content.type === "topic" && (
                      <p className="text-sm"><span className="font-medium">Title:</span> {(reportDetails.content as any).title}</p>
                    )}
                    <div className="mt-2 p-3 bg-muted rounded">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: reportDetails.content.content }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* User Stats */}
              {reportDetails.userStats && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">User Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Topics Created</p>
                      <p className="text-lg font-semibold">{reportDetails.userStats.topicCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Posts Created</p>
                      <p className="text-lg font-semibold">{reportDetails.userStats.postCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Times Reported</p>
                      <p className="text-lg font-semibold text-destructive">{reportDetails.userStats.reportCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Age</p>
                      <p className="text-sm">
                        {reportDetails.userStats.created_at &&
                          formatDistanceToNow(new Date(reportDetails.userStats.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {reportDetails.userStats.is_banned && (
                      <div className="col-span-2">
                        <p className="text-destructive font-semibold">⚠️ User is currently banned</p>
                        {reportDetails.userStats.ban_reason && (
                          <p className="text-sm text-muted-foreground">Reason: {reportDetails.userStats.ban_reason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {reportDetails?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (reportDetails.userStats) {
                      setBanUserId(reportDetails.userStats.id);
                    }
                  }}
                  disabled={reportDetails.userStats?.is_banned}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Ban User
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (reportDetails.content) {
                      if (confirm("Are you sure you want to delete this content?")) {
                        deleteContentMutation.mutate({
                          topicId: reportDetails.content.type === "topic" ? reportDetails.content.id : undefined,
                          postId: reportDetails.content.type === "post" ? reportDetails.content.id : undefined,
                        });
                      }
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Content
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (reportDetails.userStats) {
                      setUserContentUserId(reportDetails.userStats.id);
                    }
                  }}
                >
                  <User className="h-4 w-4 mr-1" />
                  View User Content
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => resolveReportMutation.mutate({ reportId: detailsReportId! })}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissReportMutation.mutate({ reportId: detailsReportId! })}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={!!banUserId} onOpenChange={(open) => !open && setBanUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>Select ban duration and provide a reason</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Duration</Label>
              <RadioGroup value={banDuration} onValueChange={(v: any) => setBanDuration(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1day" id="1day" />
                  <Label htmlFor="1day">1 Day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1week" id="1week" />
                  <Label htmlFor="1week">1 Week</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1month" id="1month" />
                  <Label htmlFor="1month">1 Month</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="permanent" id="permanent" />
                  <Label htmlFor="permanent">Permanent</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Reason (required)</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Explain why this user is being banned..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setBanUserId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!banReason.trim()) {
                  toast.error("Please provide a reason for the ban");
                  return;
                }
                banUserMutation.mutate({
                  userId: banUserId!,
                  reason: banReason,
                  duration: banDuration,
                });
              }}
              disabled={!banReason.trim() || banUserMutation.isPending}
            >
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Content Dialog */}
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
                  <div className="space-y-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Delete this topic?")) {
                                  deleteContentMutation.mutate({ topicId: topic.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  <div className="space-y-2">
                    {userContent.posts.slice(0, 10).map((post) => (
                      <Card key={post.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div
                                className="text-sm prose prose-sm dark:prose-invert max-w-none line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Delete this post?")) {
                                  deleteContentMutation.mutate({ postId: post.id });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {userContent.posts.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing 10 of {userContent.posts.length} posts
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Delete ALL content by this user? This cannot be undone!")) {
                  bulkDeleteMutation.mutate({
                    userId: userContentUserId!,
                    deleteTopics: true,
                    deletePosts: true,
                  });
                }
              }}
            >
              Delete All Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
