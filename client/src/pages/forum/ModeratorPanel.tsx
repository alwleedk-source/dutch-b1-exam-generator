import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Shield, AlertCircle, Users } from "lucide-react";
import { Link } from "wouter";

export default function ModeratorPanel() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
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
  
  const tools = [
    {
      title: t.reportsManagement || "Reports Management",
      description: t.reportsManagementDesc || "Review and resolve user reports",
      icon: AlertCircle,
      href: "/forum/reports",
      color: "text-yellow-500",
    },
    {
      title: t.userManagement || "User Management",
      description: t.userManagementDesc || "Ban/unban users and manage moderators",
      icon: Users,
      href: "/forum/users",
      color: "text-blue-500",
      adminOnly: true,
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">
                {t.moderatorPanel || "Moderator Panel"}
              </CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              {t.moderatorPanelDesc || "Manage forum content and users"}
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {tools.map((tool) => {
                // Hide admin-only tools from moderators
                if (tool.adminOnly && user.role !== "admin") {
                  return null;
                }
                
                return (
                  <Link key={tool.href} href={tool.href}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <tool.icon className={`h-8 w-8 ${tool.color}`} />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{tool.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t.moderatorTools || "Moderator Tools"}
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t.moderatorToolPin || "Pin/Unpin topics to keep them at the top"}</li>
                <li>• {t.moderatorToolLock || "Lock/Unlock topics to prevent new replies"}</li>
                <li>• {t.moderatorToolHide || "Hide/Unhide topics to remove from public view"}</li>
                <li>• {t.moderatorToolDelete || "Delete topics and posts at any time"}</li>
                <li>• {t.moderatorToolReports || "Review and resolve user reports"}</li>
                {user.role === "admin" && (
                  <>
                    <li>• {t.moderatorToolBan || "Ban/Unban users (Admin only)"}</li>
                    <li>• {t.moderatorToolModerators || "Add/Remove moderators (Admin only)"}</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
