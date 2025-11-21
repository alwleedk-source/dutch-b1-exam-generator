import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, FileText, AlertCircle, CheckCircle, XCircle, Loader2, Search, Trash2, Eye, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [examToDelete, setExamToDelete] = useState<number | null>(null);
  const [examToView, setExamToView] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 20;

  const { data: allUsers } = trpc.admin.getAllUsers.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const { data: allTexts } = trpc.admin.getAllTexts.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const { data: reports } = trpc.admin.getPendingReports.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const { data: allExams, refetch: refetchExams } = trpc.admin.getAllExams.useQuery(
    { search: searchQuery },
    { enabled: !!user && user.role === 'admin' }
  );
  const { data: examDetails } = trpc.admin.getExamDetailsAdmin.useQuery(
    { exam_id: examToView! },
    { enabled: !!examToView }
  );

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

  const deleteExamMutation = trpc.admin.deleteExam.useMutation({
    onSuccess: () => {
      toast.success("Exam deleted successfully");
      setExamToDelete(null);
      refetchExams();
    },
    onError: (error) => {
      toast.error("Failed to delete exam: " + error.message);
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
            <Button onClick={() => window.location.href = '/'}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedExams = allExams?.filter((e: any) => e.status === 'completed').length || 0;
  const inProgressExams = allExams?.filter((e: any) => e.status === 'in_progress').length || 0;

  // Pagination
  const totalPages = Math.ceil((allExams?.length || 0) / examsPerPage);
  const startIndex = (currentPage - 1) * examsPerPage;
  const endIndex = startIndex + examsPerPage;
  const paginatedExams = allExams?.slice(startIndex, endIndex) || [];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">Manage users, texts, exams, and reports</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allExams?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedExams} completed, {inProgressExams} in progress
                </p>
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

          {/* Exams Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exams Management</CardTitle>
                  <CardDescription>Search and manage all exams</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, user, or ID..."
                      className="pl-8 w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Text Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExams.map((exam: any) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-mono text-sm">{exam.id}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {exam.text_title || `Text #${exam.text_id}`}
                      </TableCell>
                      <TableCell>
                        {exam.user_name || exam.user_email || `User #${exam.user_id}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={exam.status === 'completed' ? 'default' : 'secondary'}>
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {exam.score !== null && exam.score !== undefined
                          ? `${exam.score}/${exam.total_questions}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(exam.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExamToView(exam.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExamToDelete(exam.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
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

          {/* Texts Table */}
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

          {/* Reports Table */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!examToDelete} onOpenChange={() => setExamToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete exam #{examToDelete}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => examToDelete && deleteExamMutation.mutate({ exam_id: examToDelete })}
              disabled={deleteExamMutation.isPending}
            >
              {deleteExamMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Exam Details Dialog */}
      <Dialog open={!!examToView} onOpenChange={() => setExamToView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exam Details</DialogTitle>
          </DialogHeader>
          {examDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exam ID</p>
                  <p className="text-lg font-mono">{examDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={examDetails.status === 'completed' ? 'default' : 'secondary'}>
                    {examDetails.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p>{examDetails.user?.name || examDetails.user?.email || `User #${examDetails.user_id}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Text</p>
                  <p>{examDetails.text?.title || `Text #${examDetails.text_id}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score</p>
                  <p className="text-lg font-bold">
                    {examDetails.score !== null && examDetails.score !== undefined
                      ? `${examDetails.score}/${examDetails.total_questions}`
                      : 'Not completed'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p>{new Date(examDetails.created_at).toLocaleString()}</p>
                </div>
              </div>
              {examDetails.completed_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                  <p>{new Date(examDetails.completed_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamToView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
