import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Brain, Globe, TrendingUp, Sparkles, Zap, Target, Award } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { Language } from "@shared/i18n";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">Dutch B1</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language Selector - Compact on Mobile */}
              <div className="hidden sm:flex gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage(lang.code)}
                    className="gap-1"
                  >
                    <span>{lang.flag}</span>
                    <span className="hidden md:inline">{lang.name}</span>
                  </Button>
                ))}
              </div>

              {/* Mobile Language Selector - Dropdown */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Globe className="h-4 w-4" />
                      <span>{languages.find(l => l.code === language)?.flag}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={language === lang.code ? "bg-primary/10" : ""}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="sm" className="sm:text-base">{t.dashboard}</Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm" className="sm:text-base">{t.login}</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Learning</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              {t.appTitle}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t.appSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 shadow-glow">
                    <Zap className="h-5 w-5" />
                    {t.dashboard}
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2 shadow-glow">
                    <Sparkles className="h-5 w-5" />
                    {t.getStarted}
                  </Button>
                </a>
              )}
              <Button size="lg" variant="outline">
                {t.learnMore}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4</div>
                <div className="text-sm text-muted-foreground">{t.features}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">B1</div>
                <div className="text-sm text-muted-foreground">Level Focus</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-sm text-muted-foreground">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">{t.features}</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to master Dutch B1 reading
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: t.feature1Title,
                desc: t.feature1Desc,
                color: "text-primary",
              },
              {
                icon: Globe,
                title: t.feature2Title,
                desc: t.feature2Desc,
                color: "text-secondary",
              },
              {
                icon: TrendingUp,
                title: t.feature3Title,
                desc: t.feature3Desc,
                color: "text-chart-3",
              },
              {
                icon: Target,
                title: t.feature4Title,
                desc: t.feature4Desc,
                color: "text-chart-4",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-hover animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t.howItWorks}</h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to start learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Add Dutch Text",
                desc: "Paste, upload, or scan any Dutch B1 text",
                icon: BookOpen,
              },
              {
                step: "2",
                title: "Take AI Exam",
                desc: "Answer 10 comprehension questions",
                icon: Brain,
              },
              {
                step: "3",
                title: "Track Progress",
                desc: "See your scores and learn vocabulary",
                icon: Award,
              },
            ].map((step, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-glow">
                  {step.step}
                </div>
                <step.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to master Dutch B1?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners preparing for their Dutch integration exam
          </p>
          {isAuthenticated ? (
            <Link href="/create-exam">
              <Button size="lg" className="gap-2 shadow-glow">
                <Sparkles className="h-5 w-5" />
                {t.createNewExam}
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2 shadow-glow">
                <Sparkles className="h-5 w-5" />
                {t.getStarted}
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2024 Dutch B1 Exam Generator. Built with ❤️ for immigrants in the Netherlands.</p>
        </div>
      </footer>
    </div>
  );
}
