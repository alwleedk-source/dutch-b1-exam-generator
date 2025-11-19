import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, FileText, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading } = useAuth();

  const { data: allUsers } = trpc.admin.getAllUsers.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const { data: allTexts } = trpc.admin.getPendingTexts.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const { data: reports } = trpc.admin.getPendingReports.useQuery(undefined, { enabled: !!user && user.role === 'admin' });

  const approveTextMutation = trpc.admin.approveText.useMutation({
    onSuccess: () => {
      toast.success("Text approved");
      window.location.reload();
    },
  });

  const rejectTextMutation = trpc.admin.rejectText.useMutation({
    onSuccess: () => {
      toast.success("Text rejected");
      window.location.reload();
    },
  });

  const resolveReportMutation = trpc.admin.resolveReport.useMutation({
    onSuccess: () => {
      toast.success("Report resolved");
      window.location.reload();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Admin access required</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold gradient-text">Admin Panel</h1>
              </div>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">Manage users, texts, and reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allUsers?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Texts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allTexts?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {reports?.filter((r: any) => r.status === 'pending').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Exams</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers?.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.name || "—"}</TableCell>
                      <TableCell>{u.email || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.totalExamsCompleted}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Texts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTexts?.map((text: any) => (
                    <TableRow key={text.id}>
                      <TableCell>{text.id}</TableCell>
                      <TableCell>{text.title || `Text #${text.id}`}</TableCell>
                      <TableCell>
                        <Badge variant={text.status === 'approved' ? 'default' : 'secondary'}>
                          {text.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {text.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => approveTextMutation.mutate({ text_id: text.id })}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => rejectTextMutation.mutate({ text_id: text.id })}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports?.map((report: any) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell><Badge variant="outline">{report.reportType}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => resolveReportMutation.mutate({ reportId: report.id, status: 'resolved' })}>
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
