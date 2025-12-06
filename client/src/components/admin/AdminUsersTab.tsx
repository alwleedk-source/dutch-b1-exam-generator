import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminUsersTabProps {
    users: any[];
    currentUserId: number;
    userSearch: string;
    onSearchChange: (value: string) => void;
    onViewUser: (id: number) => void;
    onDeleteUser: (id: number) => void;
}

export function AdminUsersTab({
    users,
    currentUserId,
    userSearch,
    onSearchChange,
    onViewUser,
    onDeleteUser,
}: AdminUsersTabProps) {
    const { t } = useLanguage();

    return (
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
                            placeholder={t.searchUsers}
                            className="pl-8 w-[250px]"
                            value={userSearch}
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
                        {users.map((u: any) => (
                            <TableRow
                                key={u.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onViewUser(u.id)}
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
                                            onClick={() => onViewUser(u.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {u.id !== currentUserId && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onDeleteUser(u.id)}
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
    );
}
