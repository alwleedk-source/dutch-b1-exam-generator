import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Brain, Globe, TrendingUp, Sparkles, Zap, Target, Award, CheckCircle, FileText, MessageSquare, BarChart, Languages, Repeat } from "lucide-react";
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
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">StaatKlaar</h1>
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
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              {t.staatsexamenPrep}
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 gradient-text">
              {t.masterDutchReading}
            </h1>
            
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              {t.comprehensivePreparation}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 shadow-glow w-full sm:w-auto">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t.dashboard}
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()} className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 shadow-glow w-full sm:w-auto">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t.startLearningNow}
                  </Button>
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-2xl mx-auto px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">4</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t.languagesSupported}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-secondary">B1</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t.levelFocus}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">AI</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{t.aiPowered}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t.keyFeatures}</h2>
            <p className="text-base sm:text-xl text-muted-foreground px-4">
              {t.officialExamFormat}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: Target,
                title: t.feature5Title,
                desc: t.feature5Desc,
                color: "text-primary",
              },
              {
                icon: FileText,
                title: t.feature6Title,
                desc: t.feature6Desc,
                color: "text-secondary",
              },
              {
                icon: MessageSquare,
                title: t.feature7Title,
                desc: t.feature7Desc,
                color: "text-chart-3",
              },
              {
                icon: Languages,
                title: t.feature8Title,
                desc: t.feature8Desc,
                color: "text-chart-4",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-hover animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="pb-3">
                  <feature.icon className={`h-10 w-10 sm:h-12 sm:w-12 ${feature.color} mb-3 sm:mb-4`} />
                  <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t.whyChooseUs}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: t.benefit1Title,
                desc: t.benefit1Desc,
              },
              {
                icon: CheckCircle,
                title: t.benefit2Title,
                desc: t.benefit2Desc,
              },
              {
                icon: TrendingUp,
                title: t.benefit3Title,
                desc: t.benefit3Desc,
              },
              {
                icon: BarChart,
                title: t.benefit4Title,
                desc: t.benefit4Desc,
              },
              {
                icon: Globe,
                title: t.benefit5Title,
                desc: t.benefit5Desc,
              },
              {
                icon: Repeat,
                title: t.benefit6Title,
                desc: t.benefit6Desc,
              },
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t.howItWorks}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: t.step1Title,
                desc: t.step1Desc,
                icon: BookOpen,
              },
              {
                step: "2",
                title: t.step2Title,
                desc: t.step2Desc,
                icon: Brain,
              },
              {
                step: "3",
                title: t.step3Title,
                desc: t.step3Desc,
                icon: Target,
              },
              {
                step: "4",
                title: t.step4Title,
                desc: t.step4Desc,
                icon: Award,
              },
            ].map((step, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground text-xl sm:text-2xl font-bold mb-3 sm:mb-4 shadow-glow">
                  {step.step}
                </div>
                <step.icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 sm:mb-4 text-primary" />
                <h3 className="text-base sm:text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
            {t.readyToStart}
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {t.joinLearners}
          </p>
          {isAuthenticated ? (
            <Link href="/create-exam" className="inline-block">
              <Button size="lg" className="gap-2 shadow-glow">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                {t.createNewExam}
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()} className="inline-block">
              <Button size="lg" className="gap-2 shadow-glow">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                {t.startLearningNow}
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 sm:py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 StaatKlaar. {t.staatsexamenPrep} - Built with ❤️ for immigrants in the Netherlands.</p>
        </div>
      </footer>
    </div>
  );
}
