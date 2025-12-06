import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, BookOpen, AlertCircle } from "lucide-react";

interface AdminStatsCardsProps {
    stats: {
        totalUsers: number;
        totalTexts: number;
        totalExams: number;
        completedExams: number;
        pendingTexts: number;
    } | undefined;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </div>
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
    );
}
