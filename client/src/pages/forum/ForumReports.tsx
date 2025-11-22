import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ForumReports() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"pending" | "resolved" | "all">("pending");
  
  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.forum.getReports.useQuery({ status });
  
  const resolveReportMutation = trpc.forum.resolveReport.useMutation({
    onSuccess: () => {
      toast.success(t.reportResolved || "Report resolved");
      utils.forum.getReports.invalidate();
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
      spam: t.reportReasonSpam || "Spam",
      harassment: t.reportReasonHarassment || "Harassment",
      inappropriate: t.reportReasonInappropriate || "Inappropriate content",
      misinformation: t.reportReasonMisinformation || "Misinformation",
      other: t.reportReasonOther || "Other",
    };
    return reasons[reason] || reason;
  };
  
  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/forum">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToForum || "Back to Forum"}
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {t.reportsManagement || "Reports Management"}
              </CardTitle>
              
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t.pending || "Pending"}</SelectItem>
                  <SelectItem value="resolved">{t.resolved || "Resolved"}</SelectItem>
                  <SelectItem value="all">{t.all || "All"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.loading || "Loading..."}
              </div>
            ) : !reports || reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.noReports || "No reports found"}
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className={report.status === "resolved" ? "opacity-60" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{getReasonText(report.reason)}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              report.status === "pending" 
                                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" 
                                : "bg-green-500/20 text-green-700 dark:text-green-300"
                            }`}>
                              {report.status === "pending" ? (t.pending || "Pending") : (t.resolved || "Resolved")}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {t.reportedBy || "Reported by"}: {report.reporter_name || t.unknown || "Unknown"}
                          </p>
                          
                          {report.details && (
                            <p className="text-sm mb-2">{report.details}</p>
                          )}
                          
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            {report.topic_id && (
                              <Link href={`/forum/topic/${report.topic_id}`}>
                                <Button variant="link" size="sm" className="h-auto p-0">
                                  {t.viewTopic || "View Topic"}
                                </Button>
                              </Link>
                            )}
                            <span>•</span>
                            <span>
                              {report.created_at && formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        {report.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveReportMutation.mutate({ reportId: report.id })}
                            disabled={resolveReportMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t.resolve || "Resolve"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
