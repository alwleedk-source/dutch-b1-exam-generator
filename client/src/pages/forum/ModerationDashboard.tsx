import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, AlertCircle, Shield, Activity, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function ModerationDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<"day" | "week" | "month" | "all">("week");
  
  const { data: stats, isLoading } = trpc.forumModeration.getModerationStats.useQuery({ period });
  
  // Check if user is moderator or admin
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <p className="text-muted-foreground">
                {t.moderatorAccessRequired || "Moderator access required"}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  const getPeriodText = (p: string) => {
    const periods: Record<string, string> = {
      day: "Last 24 Hours",
      week: "Last 7 Days",
      month: "Last 30 Days",
      all: "All Time",
    };
    return periods[p] || p;
  };
  
  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/forum/moderator">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Moderator Panel
          </Button>
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          </div>
          
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading statistics...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReports}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
                  <Shield className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.resolvedReports}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In {getPeriodText(period).toLowerCase()}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReports}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In {getPeriodText(period).toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Reports by Reason */}
            <Card>
              <CardHeader>
                <CardTitle>Reports by Reason</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.reportsByReason.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No reports in this period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.reportsByReason.map((item) => {
                      const total = stats.totalReports || 1;
                      const percentage = Math.round((item.count / total) * 100);
                      
                      return (
                        <div key={item.reason} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium capitalize">{item.reason}</span>
                            <span className="text-muted-foreground">
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Most Reported Users */}
            <Card>
              <CardHeader>
                <CardTitle>Most Reported Users</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.mostReportedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No reported users in this period
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.mostReportedUsers.slice(0, 10).map((item, index) => (
                      <div 
                        key={item.user_id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{item.user_name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.report_count} {item.report_count === 1 ? "report" : "reports"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Moderator Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Moderator Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.moderatorActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No moderator activity in this period
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.moderatorActivity.map((item, index) => (
                      <div 
                        key={item.moderator_id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-primary" />
                          <span className="font-medium">{item.moderator_name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.action_count} {item.action_count === 1 ? "action" : "actions"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Actions by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Moderation Actions by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.actionsByType.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No actions in this period
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.actionsByType.map((item) => {
                      const total = stats.actionsByType.reduce((sum, a) => sum + a.count, 0);
                      const percentage = Math.round((item.count / total) * 100);
                      
                      return (
                        <div key={item.action_type} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium capitalize">
                              {item.action_type.replace(/_/g, " ")}
                            </span>
                            <span className="text-muted-foreground">
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
