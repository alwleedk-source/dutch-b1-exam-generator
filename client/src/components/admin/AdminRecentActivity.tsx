import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface RecentActivityProps {
    recentTexts: any[];
    recentExams: any[];
    onViewText: (id: number) => void;
    onViewExam: (id: number) => void;
}

export function AdminRecentActivity({ recentTexts, recentExams, onViewText, onViewExam }: RecentActivityProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Texts</CardTitle>
                    <CardDescription>Latest texts submitted by users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentTexts?.slice(0, 5).map((text: any) => (
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
                                    onClick={() => onViewText(text.id)}
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
                        {recentExams?.slice(0, 5).map((exam: any) => (
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
                                    onClick={() => onViewExam(exam.id)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
