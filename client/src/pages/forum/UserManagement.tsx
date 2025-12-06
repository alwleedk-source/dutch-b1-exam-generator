import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, AlertTriangle, Shield, Ban, UserCheck, UserX, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.forum.getAllUsers.useQuery({ limit: 100 });

  const banUserMutation = trpc.forum.banUser.useMutation({
    onSuccess: () => {
      toast.success(t.userBanned || "User banned successfully");
      utils.forum.getAllUsers.invalidate();
      setBanDialogOpen(false);
      setBanReason("");
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unbanUserMutation = trpc.forum.unbanUser.useMutation({
    onSuccess: () => {
      toast.success(t.userUnbanned || "User unbanned successfully");
      utils.forum.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addModeratorMutation = trpc.forum.addModerator.useMutation({
    onSuccess: () => {
      toast.success(t.moderatorAdded || "Moderator added successfully");
      utils.forum.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeModeratorMutation = trpc.forum.removeModerator.useMutation({
    onSuccess: () => {
      toast.success(t.moderatorRemoved || "Moderator removed successfully");
      utils.forum.getAllUsers.invalidate();
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
              <p className="text-muted-foreground">
                {t.adminAccessRequired || "Admin access required"}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleBanClick = (user: any) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleBanConfirm = () => {
    if (!selectedUser || !banReason.trim()) {
      toast.error(t.banReasonRequired || "Ban reason is required");
      return;
    }

    banUserMutation.mutate({
      userId: selectedUser.id,
      reason: banReason,
      duration: "permanent",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/forum/moderator">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToModeratorPanel || "Back to Moderator Panel"}
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">
                {t.userManagement || "User Management"}
              </CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              {t.userManagementDesc || "Ban/unban users and manage moderators"}
            </p>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.loading || "Loading..."}
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t.noUsers || "No users found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.name || "Name"}</TableHead>
                      <TableHead>{t.email || "Email"}</TableHead>
                      <TableHead>{t.status || "Status"}</TableHead>
                      <TableHead>{t.joined || "Joined"}</TableHead>
                      <TableHead className="text-right">{t.actions || "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {u.role === "admin" && (
                              <Badge variant="destructive">
                                {t.admin || "Admin"}
                              </Badge>
                            )}
                            {u.isModerator && u.role !== "admin" && (
                              <Badge variant="default">
                                <Shield className="h-3 w-3 mr-1" />
                                {t.moderator || "Moderator"}
                              </Badge>
                            )}
                            {u.is_banned && (
                              <Badge variant="outline" className="border-destructive text-destructive">
                                <Ban className="h-3 w-3 mr-1" />
                                {t.banned || "Banned"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {u.created_at && formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {/* Ban/Unban */}
                            {u.role !== "admin" && (
                              <>
                                {u.is_banned ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => unbanUserMutation.mutate({ userId: u.id })}
                                    disabled={unbanUserMutation.isPending}
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    {t.unban || "Unban"}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBanClick(u)}
                                    disabled={banUserMutation.isPending}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    {t.ban || "Ban"}
                                  </Button>
                                )}
                              </>
                            )}

                            {/* Add/Remove Moderator */}
                            {u.role !== "admin" && !u.is_banned && (
                              <>
                                {u.isModerator ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeModeratorMutation.mutate({ userId: u.id })}
                                    disabled={removeModeratorMutation.isPending}
                                  >
                                    <Shield className="h-4 w-4 mr-1" />
                                    {t.removeModerator || "Remove Mod"}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addModeratorMutation.mutate({ userId: u.id })}
                                    disabled={addModeratorMutation.isPending}
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    {t.addModerator || "Add Mod"}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.banUser || "Ban User"}</DialogTitle>
            <DialogDescription>
              {t.banUserDescription || "Please provide a reason for banning this user."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="banReason">{t.reason || "Reason"}</Label>
              <Input
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={t.enterBanReason || "Enter ban reason..."}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              {t.cancel || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanConfirm}
              disabled={banUserMutation.isPending || !banReason.trim()}
            >
              {t.ban || "Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
