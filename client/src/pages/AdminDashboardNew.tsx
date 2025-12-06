import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, FileText, AlertCircle, CheckCircle, XCircle, Loader2, Search, Trash2, Eye,
  BookOpen, TrendingUp, Activity, UserCog, Filter, X
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Search and filter states
  const [examSearch, setExamSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [textStatusFilter, setTextStatusFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");

  // Dialog states
  const [examToDelete, setExamToDelete] = useState<number | null>(null);
  const [examToView, setExamToView] = useState<number | null>(null);
  const [textToDelete, setTextToDelete] = useState<number | null>(null);
  const [textToView, setTextToView] = useState<number | null>(null);
  const [userToView, setUserToView] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Pagination states
  const [examsPage, setExamsPage] = useState(1);
  const [textsPage, setTextsPage] = useState(1);
  const itemsPerPage = 20;

  // Queries
  const { data: stats } = trpc.admin.getDashboardStats.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const { data: recentActivity } = trpc.admin.getRecentActivity.useQuery({ limit: 10 }, { enabled: !!user && user.role === 'admin' });
  const { data: allUsers, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery(undefined, { enabled: !!user && user.role === 'admin' });
  const { data: allExams, refetch: refetchExams } = trpc.admin.getAllExams.useQuery(
    { search: examSearch },
    { enabled: !!user && user.role === 'admin' }
  );
  const { data: filteredTexts, refetch: refetchTexts } = trpc.admin.getTextsFiltered.useQuery(
    {
      search: textSearch || undefined,
      status: textStatusFilter !== "all" ? textStatusFilter as any : undefined,
      limit: 100
    },
    { enabled: !!user && user.role === 'admin' }
  );
  const { data: textDetails } = trpc.admin.getTextWithDetails.useQuery(
    { textId: textToView! },
    { enabled: !!textToView }
  );
  const { data: examDetails } = trpc.admin.getExamDetailsAdmin.useQuery(
    { exam_id: examToView! },
    { enabled: !!examToView }
  );
  const { data: userDetails } = trpc.admin.getUserDetails.useQuery(
    { userId: userToView! },
    { enabled: !!userToView }
  );

  // Mutations
  const approveTextMutation = trpc.admin.approveText.useMutation({
    onSuccess: () => {
      toast.success("Text approved successfully");
      refetchTexts();
      setTextToView(null);
    },
  });

  const rejectTextMutation = trpc.admin.rejectText.useMutation({
    onSuccess: () => {
      toast.success("Text rejected successfully");
      refetchTexts();
      setTextToView(null);
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

  const deleteTextMutation = trpc.admin.deleteText.useMutation({
    onSuccess: () => {
      toast.success("Text deleted successfully");
      setTextToDelete(null);
      refetchTexts();
    },
    onError: (error) => {
      toast.error("Failed to delete text: " + error.message);
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      setUserToDelete(null);
      refetchUsers();
    },
    onError: (error) => {
      toast.error("Failed to delete user: " + error.message);
    },
  });

  const updateUserRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetchUsers();
    },
    onError: (error) => {
      toast.error("Failed to update user role: " + error.message);
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

  // Filter users by search
  const filteredUsers = allUsers?.filter((u: any) =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  ) || [];

  // Pagination for exams
  const totalExamsPages = Math.ceil((allExams?.length || 0) / itemsPerPage);
  const paginatedExams = allExams?.slice((examsPage - 1) * itemsPerPage, examsPage * itemsPerPage) || [];

  // Pagination for texts
  const totalTextsPages = Math.ceil((filteredTexts?.length || 0) / itemsPerPage);
  const paginatedTexts = filteredTexts?.slice((textsPage - 1) * itemsPerPage, textsPage * itemsPerPage) || [];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">Comprehensive platform management</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="texts">
                <FileText className="h-4 w-4 mr-2" />
                Texts ({filteredTexts?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="exams">
                <BookOpen className="h-4 w-4 mr-2" />
                Exam Results ({allExams?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users ({allUsers?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Texts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalTexts || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.pendingTexts || 0} pending approval
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalExams || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.completedExams || 0} completed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{stats?.pendingTexts || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Texts awaiting approval</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Texts</CardTitle>
                    <CardDescription>Latest texts submitted by users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity?.recentTexts.slice(0, 5).map((text: any) => (
                        <div key={text.id} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{text.title || `Text #${text.id}`}</p>
                            <p className="text-xs text-muted-foreground">
                              by {text.user_name || text.user_email || 'Unknown'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTextToView(text.id);
                              setActiveTab("texts");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Exam Results</CardTitle>
                    <CardDescription>Latest completed exams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity?.recentExams.slice(0, 5).map((exam: any) => (
                        <div key={exam.id} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{exam.text_title || `Text #${exam.text_id}`}</p>
                            <p className="text-xs text-muted-foreground">
                              by {exam.user_name || exam.user_email || 'Unknown'}
                              {exam.score !== null && ` • ${exam.score}/${exam.total_questions}`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setExamToView(exam.id);
                              setActiveTab("exams");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Texts Tab */}
            <TabsContent value="texts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Texts Management</CardTitle>
                      <CardDescription>
                        View and manage all Dutch texts submitted for exam generation
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={textStatusFilter} onValueChange={setTextStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search texts..."
                          className="pl-8 w-[250px]"
                          value={textSearch}
                          onChange={(e) => setTextSearch(e.target.value)}
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
                        <TableHead>Title</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Words</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTexts.map((text: any) => (
                        <TableRow
                          key={text.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setTextToView(text.id)}
                        >
                          <TableCell className="font-mono text-sm">{text.id}</TableCell>
                          <TableCell className="max-w-xs truncate font-medium">
                            {text.title || `Text #${text.id}`}
                          </TableCell>
                          <TableCell className="text-sm">
                            {text.user_name || text.user_email || `User #${text.created_by}`}
                          </TableCell>
                          <TableCell className="text-sm">{text.word_count || '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                text.status === 'approved' ? 'default' :
                                  text.status === 'rejected' ? 'destructive' :
                                    'secondary'
                              }
                            >
                              {text.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(text.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTextToView(text.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setTextToDelete(text.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalTextsPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTextsPage(p => Math.max(1, p - 1))}
                        disabled={textsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {textsPage} of {totalTextsPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTextsPage(p => Math.min(totalTextsPages, p + 1))}
                        disabled={textsPage === totalTextsPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Exam Results Management</CardTitle>
                      <CardDescription>
                        View completed exam results and user performance
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search exams..."
                        className="pl-8 w-[250px]"
                        value={examSearch}
                        onChange={(e) => setExamSearch(e.target.value)}
                      />
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
                        <TableRow
                          key={exam.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExamToView(exam.id)}
                        >
                          <TableCell className="font-mono text-sm">{exam.id}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {exam.text_title || `Text #${exam.text_id}`}
                          </TableCell>
                          <TableCell className="text-sm">
                            {exam.user_name || exam.user_email || `User #${exam.user_id}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={exam.status === 'completed' ? 'default' : 'secondary'}>
                              {exam.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {exam.score !== null && exam.score !== undefined
                              ? `${exam.score}/${exam.total_questions} (${Math.round((exam.score / exam.total_questions) * 100)}%)`
                              : '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(exam.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
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
                  {totalExamsPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExamsPage(p => Math.max(1, p - 1))}
                        disabled={examsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {examsPage} of {totalExamsPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExamsPage(p => Math.min(totalExamsPages, p + 1))}
                        disabled={examsPage === totalExamsPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Users Management</CardTitle>
                      <CardDescription>
                        Manage user accounts, roles, and view user activity
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8 w-[250px]"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Texts Created</TableHead>
                        <TableHead>Exams Taken</TableHead>
                        <TableHead>Avg Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u: any) => (
                        <TableRow
                          key={u.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setUserToView(u.id)}
                        >
                          <TableCell className="font-mono text-sm">{u.id}</TableCell>
                          <TableCell className="font-medium">{u.name || "—"}</TableCell>
                          <TableCell className="text-sm">{u.email || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{u.totalTextsCreated || 0}</TableCell>
                          <TableCell className="text-center">{u.totalExamsCompleted || 0}</TableCell>
                          <TableCell className="text-center font-medium">
                            {u.averageScore > 0 ? `${u.averageScore}%` : '—'}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setUserToView(u.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {u.id !== user.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setUserToDelete(u.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Text Details Dialog */}
      <Dialog open={!!textToView} onOpenChange={(open) => !open && setTextToView(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Text Details</DialogTitle>
            <DialogDescription>
              Review the complete text and generated questions
            </DialogDescription>
          </DialogHeader>
          {textDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p>{textDetails.title || `Text #${textDetails.id}`}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-medium">{textDetails.user_name || textDetails.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={textDetails.status === 'approved' ? 'default' : 'secondary'}>
                    {textDetails.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Word Count</p>
                  <p className="font-medium">{textDetails.word_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reading Time</p>
                  <p className="font-medium">{textDetails.estimated_reading_minutes} min</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dutch Text</h3>
                <div className="bg-muted p-4 rounded-lg max-h-[300px] overflow-y-auto">
                  <p className="whitespace-pre-wrap text-sm">{textDetails.dutch_text}</p>
                </div>
              </div>
              {textDetails.questions && (
                <div>
                  <h3 className="font-semibold mb-2">Generated Questions</h3>
                  <div className="space-y-3">
                    {JSON.parse(textDetails.questions as string).map((q: any, idx: number) => (
                      <div key={idx} className="bg-muted p-3 rounded-lg">
                        <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                        <div className="space-y-1 ml-4">
                          {q.options.map((opt: string, optIdx: number) => (
                            <p key={optIdx} className={opt === q.correct_answer ? 'text-green-600 font-medium' : ''}>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {textDetails?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => rejectTextMutation.mutate({ text_id: textToView! })}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => approveTextMutation.mutate({ text_id: textToView! })}
                >
                  Approve
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setTextToView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Details Dialog */}
      <Dialog open={!!examToView} onOpenChange={(open) => !open && setExamToView(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exam Result Details</DialogTitle>
            <DialogDescription>
              Complete exam information and user answers
            </DialogDescription>
          </DialogHeader>
          {examDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{examDetails.user?.name || examDetails.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="font-medium text-lg">
                    {examDetails.correct_answers || 0}/{examDetails.total_questions}
                    ({Math.round(((examDetails.correct_answers || 0) / examDetails.total_questions) * 100)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="font-medium">{examDetails.time_spent_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(examDetails.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Text Title</h3>
                <p>{examDetails.text?.title || `Text #${examDetails.text_id}`}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamToView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!userToView} onOpenChange={(open) => !open && setUserToView(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete user information and activity
            </DialogDescription>
          </DialogHeader>
          {userDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{userDetails.user.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userDetails.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge>{userDetails.user.role}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{new Date(userDetails.user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Created Texts ({userDetails.texts.length})</h3>
                {userDetails.texts.length > 0 ? (
                  <div className="space-y-2">
                    {userDetails.texts.slice(0, 5).map((text: any) => (
                      <div key={text.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{text.title || `Text #${text.id}`}</span>
                        <Badge variant="secondary">{text.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No texts created</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Exam Results ({userDetails.exams.length})</h3>
                {userDetails.exams.length > 0 ? (
                  <div className="space-y-2">
                    {userDetails.exams.slice(0, 5).map((exam: any) => (
                      <div key={exam.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{exam.text_title || `Text #${exam.text_id}`}</span>
                        <span className="text-sm font-medium">
                          {exam.score !== null ? `${exam.score}/${exam.total_questions}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No exams taken</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <Dialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the exam result.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteExamMutation.mutate({ exam_id: examToDelete! })}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!textToDelete} onOpenChange={(open) => !open && setTextToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Text?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the text and all associated exams.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTextToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTextMutation.mutate({ text_id: textToDelete! })}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user and all their data (texts, exams, vocabulary).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteUserMutation.mutate({ userId: userToDelete! })}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
