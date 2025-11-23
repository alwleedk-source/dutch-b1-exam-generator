import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Settings } from "lucide-react";

export default function AdminSettings() {
  const { t } = useLanguage();
  
  // Get current exam creation status
  const { data: examCreationStatus, isLoading, refetch } = trpc.settings.isExamCreationEnabled.useQuery();
  
  // Toggle mutation
  const toggleMutation = trpc.settings.toggleExamCreation.useMutation({
    onSuccess: () => {
      toast.success(t.settingUpdated);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleToggle = (enabled: boolean) => {
    toggleMutation.mutate({ enabled });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          {t.adminSettings}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t.systemSettings}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.examCreation}</CardTitle>
          <CardDescription>
            {examCreationStatus?.enabled ? t.examCreationEnabled : t.examCreationDisabled}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="exam-creation-toggle" className="text-base">
                {t.examCreation}
              </Label>
              <div className="text-sm text-muted-foreground">
                {examCreationStatus?.enabled 
                  ? t.disableExamCreation
                  : t.enableExamCreation
                }
              </div>
            </div>
            <Switch
              id="exam-creation-toggle"
              checked={examCreationStatus?.enabled || false}
              onCheckedChange={handleToggle}
              disabled={toggleMutation.isPending}
            />
          </div>
          
          {toggleMutation.isPending && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.settingUpdated}...
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>{t.note}:</strong> {t.examCreationDisabledMessage}
        </p>
      </div>
    </div>
  );
}
