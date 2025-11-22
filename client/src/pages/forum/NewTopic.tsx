import { useAuth } from "@/_core/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ForumEditor } from "@/components/ForumEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Send } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function NewTopic() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryFromUrl, setCategoryFromUrl] = useState<string | null>(null);
  
  const { data: categories } = trpc.forum.getCategories.useQuery();
  
  // Filter categories by current language
  const filteredCategories = categories?.filter(cat => cat.language === language) || [];
  
  // Set default category from URL
  useEffect(() => {
    const urlCategory = new URLSearchParams(searchParams).get("category");
    if (urlCategory) {
      setCategoryId(urlCategory);
      setCategoryFromUrl(urlCategory);
    }
  }, [searchParams]);
  
  const createTopicMutation = trpc.forum.createTopic.useMutation({
    onSuccess: (data) => {
      toast.success(t.topicCreated || "Topic created successfully!");
      setLocation(`/forum/topic/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error(t.fillAllFields || "Please fill all fields");
      return;
    }
    
    createTopicMutation.mutate({
      categoryId: parseInt(categoryId),
      title,
      content,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                {t.loginToCreateTopic || "Please log in to create a topic"}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/forum">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToForum || "Back to Forum"}
          </Button>
        </Link>

        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-6">
              {t.createNewTopic || "Create New Topic"}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category - only show if not coming from a category page */}
              {!categoryFromUrl && (
                <div>
                  <Label htmlFor="category">{t.category || "Category"}</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCategory || "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.icon} {t[cat.name_key as keyof typeof t] || cat.name_key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Show selected category as read-only if coming from category page */}
              {categoryFromUrl && (
                <div>
                  <Label>{t.category || "Category"}</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    {filteredCategories.find(cat => cat.id.toString() === categoryFromUrl)?.icon}
                    <span className="font-medium">
                      {filteredCategories.find(cat => cat.id.toString() === categoryFromUrl) && 
                        t[filteredCategories.find(cat => cat.id.toString() === categoryFromUrl)!.name_key as keyof typeof t]}
                    </span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <Label htmlFor="title">{t.topicTitle || "Topic Title"}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.enterTopicTitle || "Enter a descriptive title..."}
                  maxLength={255}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {title.length}/255 {t.characters || "characters"}
                </p>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">{t.content || "Content"}</Label>
                <ForumEditor
                  value={content}
                  onChange={setContent}
                  placeholder={t.writeYourTopic || "Write your topic content..."}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {content.length}/10000 {t.characters || "characters"}
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createTopicMutation.isPending || !title.trim() || !content.trim() || !categoryId}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createTopicMutation.isPending ? t.creating || "Creating..." : t.createTopic || "Create Topic"}
                </Button>
                
                <Link href="/forum">
                  <Button type="button" variant="outline">
                    {t.cancel || "Cancel"}
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
