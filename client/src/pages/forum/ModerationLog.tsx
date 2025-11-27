import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, AlertTriangle, Shield, Ban, CheckCircle, Trash2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function ModerationLog() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const { data: log, isLoading } = trpc.forum.getModerationLog.useQuery({ limit: 100 });
  
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
  
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "ban":
        return <Ban className="h-4 w-4" />;
      case "unban":
        return <CheckCircle className="h-4 w-4" />;
      case "delete_topic":
      case "delete_post":
      case "bulk_delete":
        return <Trash2 className="h-4 w-4" />;
      case "warn":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };
  
  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "ban":
        return "destructive";
      case "unban":
        return "default";
      case "delete_topic":
      case "delete_post":
      case "bulk_delete":
        return "secondary";
      case "warn":
        return "outline";
      default:
        return "outline";
    }
  };
  
  const getActionText = (actionType: string) => {
    const actions: Record<string, string> = {
      ban: "Banned User",
      unban: "Unbanned User",
      delete_topic: "Deleted Topic",
      delete_post: "Deleted Post",
      bulk_delete: "Bulk Deleted Content",
      warn: "Warned User",
    };
    return actions[actionType] || actionType;
  };
  
  const getDurationText = (duration: string | null) => {
    if (!duration) return "";
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
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Moderation Log</CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              Complete audit trail of all moderation actions
            </p>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !log || log.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No moderation actions yet</div>
            ) : (
              <div className="space-y-3">
                {log.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getActionIcon(entry.action_type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getActionColor(entry.action_type) as any}>
                              {getActionText(entry.action_type)}
                            </Badge>
                            {entry.ban_duration && (
                              <Badge variant="outline">
                                {getDurationText(entry.ban_duration)}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="font-medium">Moderator:</span>{" "}
                              {entry.moderator_name || "Unknown"}
                            </p>
                            
                            {entry.target_user_name && (
                              <p>
                                <span className="font-medium">Target User:</span>{" "}
                                {entry.target_user_name}
                              </p>
                            )}
                            
                            {entry.reason && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Reason:</span> {entry.reason}
                              </p>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              {entry.created_at && formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                            </p>
                          </div>
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
    </div>
  );
}
