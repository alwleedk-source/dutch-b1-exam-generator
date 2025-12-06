import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminExamsTabProps {
    exams: any[];
    totalPages: number;
    currentPage: number;
    examSearch: string;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onViewExam: (id: number) => void;
    onDeleteExam: (id: number) => void;
}

export function AdminExamsTab({
    exams,
    totalPages,
    currentPage,
    examSearch,
    onSearchChange,
    onPageChange,
    onViewExam,
    onDeleteExam,
}: AdminExamsTabProps) {
    const { t } = useLanguage();

    return (
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
                            placeholder={t.searchExams}
                            className="pl-8 w-[250px]"
                            value={examSearch}
                            onChange={(e) => onSearchChange(e.target.value)}
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
                        {exams.map((exam: any) => (
                            <TableRow
                                key={exam.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onViewExam(exam.id)}
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
                                            onClick={() => onViewExam(exam.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDeleteExam(exam.id)}
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
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
