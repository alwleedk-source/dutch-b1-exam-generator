import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Eye, Ban, Trash2, User, CheckCircle, XCircle, AlertTriangle, EyeOff, AlertOctagon, Filter } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState, useMemo } from "react";

export default function ForumReportsEnhanced() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"pending" | "resolved" | "all">("pending");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all");
  
  // Dialog states
  const [detailsReportId, setDetailsReportId] = useState<number | null>(null);
  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [banDuration, setBanDuration] = useState<"1day" | "1week" | "1month" | "permanent">("1week");
  const [banReason, setBanReason] = useState("");
  const [userContentUserId, setUserContentUserId] = useState<number | null>(null);
  
  // Quick action states
  const [showDeleteBanDialog, setShowDeleteBanDialog] = useState(false);
  const [showHideWarnDialog, setShowHideWarnDialog] = useState(false);
  const [quickActionData, setQuickActionData] = useState<any>(null);
  const [warnReason, setWarnReason] = useState("");
  const [warnSeverity, setWarnSeverity] = useState<"low" | "medium" | "high">("medium");
  
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
  const { data: userWarnings } = trpc.forumModeration.getUserWarnings.useQuery(
    { userId: reportDetails?.userStats?.id || 0 },
    { enabled: !!reportDetails?.userStats?.id }
  );
  const { data: moderatorNotes } = trpc.forumModeration.getModeratorNotes.useQuery(
    { userId: reportDetails?.userStats?.id || 0 },
    { enabled: !!reportDetails?.userStats?.id }
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
  
  const deleteAndBanMutation = trpc.forumModeration.deleteAndBan.useMutation({
    onSuccess: () => {
      toast.success("Content deleted and user banned");
      utils.forum.getReports.invalidate();
      setShowDeleteBanDialog(false);
      setDetailsReportId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const hideAndWarnMutation = trpc.forumModeration.hideAndWarn.useMutation({
    onSuccess: () => {
      toast.success("Content hidden and user warned");
      utils.forum.getReports.invalidate();
      setShowHideWarnDialog(false);
      setDetailsReportId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const addNoteMutation = trpc.forumModeration.addModeratorNote.useMutation({
    onSuccess: () => {
      toast.success("Note added");
      utils.forumModeration.getModeratorNotes.invalidate();
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
  
  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    
    return reports.filter(report => {
      if (reasonFilter !== "all" && report.reason !== reasonFilter) return false;
      if (contentTypeFilter === "topic" && !report.topic_id) return false;
      if (contentTypeFilter === "post" && !report.post_id) return false;
      return true;
    });
  }, [reports, reasonFilter, contentTypeFilter]);
  
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
  
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
      medium: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
      high: "bg-red-500/20 text-red-700 dark:text-red-300",
    };
    return colors[severity] || colors.medium;
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-2xl">Reports Management</CardTitle>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate</SelectItem>
                    <SelectItem value="misinformation">Misinformation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="topic">Topics</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                  </SelectContent>
                </Select>
                
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
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {reports && reports.length > 0 ? "No reports match the filters" : "No reports found"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Card key={report.id} className={report.status !== "pending" ? "opacity-60" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-semibold">{getReasonText(report.reason)}</span>
                            <Badge variant={report.topic_id ? "default" : "secondary"}>
                              {report.topic_id ? "Topic" : "Post"}
                            </Badge>
                            <span className={`text-xs px-2 py-1 rounded ${
                              report.status === "pending" 
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
      
      {/* Report Details Modal - Enhanced with warnings and notes */}
      <Dialog open={!!detailsReportId} onOpenChange={(open) => !open && setDetailsReportId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    <p className="text-sm"><span className="font-medium">Type:</span> {reportDetails.content.type}</p>
                    <p className="text-sm"><span className="font-medium">Author:</span> {reportDetails.content.user_name}</p>
                    {reportDetails.content.type === "topic" && (
                      <p className="text-sm"><span className="font-medium">Title:</span> {reportDetails.content.title}</p>
                    )}
                    <div className="mt-2 p-3 bg-muted rounded max-h-64 overflow-y-auto">
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
              
              {/* User Warnings */}
              {userWarnings && userWarnings.length > 0 && (
                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 rounded">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertOctagon className="h-5 w-5 text-orange-500" />
                    Previous Warnings ({userWarnings.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userWarnings.slice(0, 5).map((warning) => (
                      <div key={warning.id} className="text-sm p-2 bg-background rounded">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={getSeverityColor(warning.severity)}>
                            {warning.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {warning.created_at && formatDistanceToNow(new Date(warning.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{warning.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {warning.moderator_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Moderator Notes */}
              {moderatorNotes && moderatorNotes.length > 0 && (
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded">
                  <h3 className="font-semibold mb-2">Internal Notes ({moderatorNotes.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {moderatorNotes.slice(0, 5).map((note) => (
                      <div key={note.id} className="text-sm p-2 bg-background rounded">
                        <p className="text-muted-foreground">{note.note}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.moderator_name} • {note.created_at && formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex-wrap gap-2">
            {reportDetails?.status === "pending" && (
              <>
                {/* Quick Actions */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setQuickActionData(reportDetails);
                    setShowDeleteBanDialog(true);
                  }}
                  disabled={reportDetails.userStats?.is_banned}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Delete & Ban
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => {
                    setQuickActionData(reportDetails);
                    setShowHideWarnDialog(true);
                  }}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide & Warn
                </Button>
                
                {/* Standard Actions */}
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
                  Delete Only
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
      
      {/* Delete & Ban Dialog */}
      <Dialog open={showDeleteBanDialog} onOpenChange={setShowDeleteBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content & Ban User</DialogTitle>
            <DialogDescription>This will delete the reported content and ban the user</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Ban Duration</Label>
              <RadioGroup value={banDuration} onValueChange={(v: any) => setBanDuration(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1day" id="ban-1day" />
                  <Label htmlFor="ban-1day">1 Day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1week" id="ban-1week" />
                  <Label htmlFor="ban-1week">1 Week</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1month" id="ban-1month" />
                  <Label htmlFor="ban-1month">1 Month</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="permanent" id="ban-permanent" />
                  <Label htmlFor="ban-permanent">Permanent</Label>
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
            <Button variant="ghost" onClick={() => setShowDeleteBanDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!banReason.trim()) {
                  toast.error("Please provide a reason");
                  return;
                }
                if (quickActionData?.content && quickActionData?.userStats) {
                  deleteAndBanMutation.mutate({
                    userId: quickActionData.userStats.id,
                    topicId: quickActionData.content.type === "topic" ? quickActionData.content.id : undefined,
                    postId: quickActionData.content.type === "post" ? quickActionData.content.id : undefined,
                    banReason: banReason,
                    banDuration: banDuration,
                  });
                }
              }}
              disabled={!banReason.trim()}
            >
              Confirm Delete & Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hide & Warn Dialog */}
      <Dialog open={showHideWarnDialog} onOpenChange={setShowHideWarnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide Content & Warn User</DialogTitle>
            <DialogDescription>This will hide the content and send a warning to the user</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Warning Severity</Label>
              <RadioGroup value={warnSeverity} onValueChange={(v: any) => setWarnSeverity(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="warn-low" />
                  <Label htmlFor="warn-low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="warn-medium" />
                  <Label htmlFor="warn-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="warn-high" />
                  <Label htmlFor="warn-high">High</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label>Warning Reason (required)</Label>
              <Textarea
                value={warnReason}
                onChange={(e) => setWarnReason(e.target.value)}
                placeholder="Explain the warning to the user..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowHideWarnDialog(false)}>Cancel</Button>
            <Button
              variant="default"
              onClick={() => {
                if (!warnReason.trim()) {
                  toast.error("Please provide a reason");
                  return;
                }
                if (quickActionData?.content && quickActionData?.userStats) {
                  hideAndWarnMutation.mutate({
                    userId: quickActionData.userStats.id,
                    topicId: quickActionData.content.type === "topic" ? quickActionData.content.id : undefined,
                    postId: quickActionData.content.type === "post" ? quickActionData.content.id : undefined,
                    warnReason: warnReason,
                    severity: warnSeverity,
                  });
                }
              }}
              disabled={!warnReason.trim()}
            >
              Confirm Hide & Warn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Content Dialog - Same as before */}
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
