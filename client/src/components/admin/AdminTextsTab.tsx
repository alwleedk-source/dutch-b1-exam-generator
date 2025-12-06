import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminTextsTabProps {
    texts: any[];
    totalPages: number;
    currentPage: number;
    textSearch: string;
    textStatusFilter: string;
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onViewText: (id: number) => void;
    onDeleteText: (id: number) => void;
}

export function AdminTextsTab({
    texts,
    totalPages,
    currentPage,
    textSearch,
    textStatusFilter,
    onSearchChange,
    onStatusFilterChange,
    onPageChange,
    onViewText,
    onDeleteText,
}: AdminTextsTabProps) {
    const { t } = useLanguage();

    return (
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
                        <Select value={textStatusFilter} onValueChange={onStatusFilterChange}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.allStatus}</SelectItem>
                                <SelectItem value="pending">{t.pending}</SelectItem>
                                <SelectItem value="approved">{t.approved}</SelectItem>
                                <SelectItem value="rejected">{t.rejected}</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t.searchTexts}
                                className="pl-8 w-[250px]"
                                value={textSearch}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.id}</TableHead>
                            <TableHead>{t.title}</TableHead>
                            <TableHead>{t.createdBy}</TableHead>
                            <TableHead>{t.words}</TableHead>
                            <TableHead>{t.status}</TableHead>
                            <TableHead>{t.date}</TableHead>
                            <TableHead>{t.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {texts.map((text: any) => (
                            <TableRow
                                key={text.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onViewText(text.id)}
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
                                            onClick={() => onViewText(text.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDeleteText(text.id)}
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
