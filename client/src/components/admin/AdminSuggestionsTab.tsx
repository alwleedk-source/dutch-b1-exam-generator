import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface AdminSuggestionsTabProps {
    suggestions: any[] | undefined;
    onDeleteSuggestion: (id: number) => void;
}

export function AdminSuggestionsTab({
    suggestions,
    onDeleteSuggestion,
}: AdminSuggestionsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Topic Suggestions</CardTitle>
                <CardDescription>
                    Review topic suggestions from users
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suggestions?.map((suggestion: any) => (
                            <TableRow key={suggestion.id}>
                                <TableCell className="font-mono text-sm">{suggestion.id}</TableCell>
                                <TableCell className="text-sm">
                                    {suggestion.user_name || suggestion.user_email || `User #${suggestion.user_id}`}
                                </TableCell>
                                <TableCell className="font-medium">{suggestion.topic}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(suggestion.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onDeleteSuggestion(suggestion.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!suggestions || suggestions.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    No topic suggestions yet
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
