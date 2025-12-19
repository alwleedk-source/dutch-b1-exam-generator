import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BookOpen, Brain, Globe, TrendingUp, Sparkles, Zap, Target, Award,
  CheckCircle, FileText, MessageSquare, Languages, Play,
  GraduationCap, Trophy, Clock, Users, Star, ArrowRight, Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { Language } from "@shared/i18n";
import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

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

  // Demo question for interactive preview
  const demoQuestion = {
    text: "De bibliotheek is elke dag open van 9 uur 's ochtends tot 9 uur 's avonds. Op zondag is de bibliotheek gesloten.",
    question: "Wanneer is de bibliotheek gesloten?",
    options: [
      "Op maandag",
      "Op zondag",
      "Van 9 tot 21 uur",
      "Nooit"
    ],
    correctAnswer: 1
  };

  const handleAnswerClick = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-gradient-bg overflow-hidden">
        {/* Decorative floating elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
        </div>

        {/* Header */}
        <header className="border-b border-border/50 glass sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text">StaatsKlaar</h1>
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
                    <Button size="sm" className="sm:text-base shadow-glow">{t.login}</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Enhanced */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-center lg:text-left animate-fade-in">
                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                  <span className="trust-badge">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>100% Gratis</span>
                  </span>
                  <span className="trust-badge">
                    <Zap className="h-3 w-3 text-yellow-600" />
                    <span>AI-Powered</span>
                  </span>
                  <span className="trust-badge">
                    <Users className="h-3 w-3 text-blue-600" />
                    <span>1000+ Gebruikers</span>
                  </span>
                </div>

                <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  {t.staatsexamenPrep}
                </Badge>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
                  <span className="gradient-text">{t.masterDutchReading}</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                  {t.comprehensivePreparation}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href={getLoginUrl()} className="w-full sm:w-auto">
                    <Button size="lg" className="gap-2 shadow-glow w-full text-lg py-6">
                      <Play className="h-5 w-5" />
                      {t.startLearningNow}
                    </Button>
                  </a>
                  <Link href="/public-exams" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="gap-2 w-full text-lg py-6">
                      <BookOpen className="h-5 w-5" />
                      {t.browsePublicExams}
                    </Button>
                  </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
                  <div className="text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold text-primary animate-count">4</div>
                    <div className="text-sm text-muted-foreground">{t.languagesSupported}</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold text-secondary animate-count">B1</div>
                    <div className="text-sm text-muted-foreground">{t.levelFocus}</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl sm:text-4xl font-bold gradient-text animate-count">AI</div>
                    <div className="text-sm text-muted-foreground">{t.aiPowered}</div>
                  </div>
                </div>
              </div>

              {/* Right: Interactive Demo */}
              <div className="relative animate-slide-up">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
                <Card className="relative preview-card border-primary/20 shadow-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="gap-1">
                        <GraduationCap className="h-3 w-3" />
                        B1 Niveau
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Target className="h-3 w-3" />
                        Demo
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">Probeer het nu! 👇</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Demo Text */}
                    <div className="p-4 bg-muted/50 rounded-lg border text-sm leading-relaxed">
                      {demoQuestion.text}
                    </div>

                    {/* Demo Question */}
                    <div className="space-y-3">
                      <p className="font-medium">{demoQuestion.question}</p>
                      <div className="space-y-2">
                        {demoQuestion.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerClick(index)}
                            disabled={showResult}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-300 ${showResult
                                ? index === demoQuestion.correctAnswer
                                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                                  : selectedAnswer === index
                                    ? "border-red-500 bg-red-50 dark:bg-red-950"
                                    : "border-border"
                                : selectedAnswer === index
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${showResult && index === demoQuestion.correctAnswer
                                  ? "border-green-500 bg-green-500 text-white"
                                  : showResult && selectedAnswer === index
                                    ? "border-red-500 bg-red-500 text-white"
                                    : "border-current"
                                }`}>
                                {showResult && index === demoQuestion.correctAnswer ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  String.fromCharCode(65 + index)
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Result */}
                    {showResult && (
                      <div className={`p-4 rounded-lg animate-scale-in ${selectedAnswer === demoQuestion.correctAnswer
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                        }`}>
                        <div className="flex items-center gap-2 font-medium">
                          {selectedAnswer === demoQuestion.correctAnswer ? (
                            <>
                              <Trophy className="h-5 w-5" />
                              <span>Goed gedaan! 🎉</span>
                            </>
                          ) : (
                            <>
                              <Target className="h-5 w-5" />
                              <span>Bijna! Het juiste antwoord is B.</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm mt-2 opacity-80">
                          Meld je aan om meer te oefenen en je voortgang te volgen!
                        </p>
                        <a href={getLoginUrl()} className="inline-block mt-3">
                          <Button size="sm" className="gap-1">
                            <ArrowRight className="h-4 w-4" />
                            Start Nu
                          </Button>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section - Enhanced */}
        <section className="py-16 sm:py-24 px-4 relative">
          <div className="absolute inset-0 bg-muted/30" />
          <div className="container mx-auto relative">
            <div className="text-center mb-12 sm:mb-16 animate-slide-up">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Features
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t.keyFeatures}</h2>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                {t.officialExamFormat}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: Target,
                  title: t.feature5Title,
                  desc: t.feature5Desc,
                  color: "text-orange-500",
                  bgColor: "bg-orange-500/10",
                },
                {
                  icon: FileText,
                  title: t.feature6Title,
                  desc: t.feature6Desc,
                  color: "text-blue-500",
                  bgColor: "bg-blue-500/10",
                },
                {
                  icon: MessageSquare,
                  title: t.feature7Title,
                  desc: t.feature7Desc,
                  color: "text-green-500",
                  bgColor: "bg-green-500/10",
                },
                {
                  icon: Languages,
                  title: t.feature8Title,
                  desc: t.feature8Desc,
                  color: "text-purple-500",
                  bgColor: "bg-purple-500/10",
                },
              ].map((feature, index) => (
                <Card key={index} className="feature-card-enhanced card-hover animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-3">
                    <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{feature.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section - Enhanced */}
        <section className="py-16 sm:py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-4">
                <Award className="h-3 w-3 mr-1" />
                Voordelen
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t.whyChooseUs}</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Brain,
                  title: t.benefit1Title,
                  desc: t.benefit1Desc,
                  color: "text-primary",
                },
                {
                  icon: CheckCircle,
                  title: t.benefit2Title,
                  desc: t.benefit2Desc,
                  color: "text-green-500",
                },
                {
                  icon: TrendingUp,
                  title: t.benefit3Title,
                  desc: t.benefit3Desc,
                  color: "text-blue-500",
                },
                {
                  icon: Clock,
                  title: t.benefit4Title,
                  desc: t.benefit4Desc,
                  color: "text-orange-500",
                },
                {
                  icon: Globe,
                  title: t.benefit5Title,
                  desc: t.benefit5Desc,
                  color: "text-purple-500",
                },
                {
                  icon: Star,
                  title: t.benefit6Title,
                  desc: t.benefit6Desc,
                  color: "text-yellow-500",
                },
              ].map((benefit, index) => (
                <div key={index} className="flex gap-4 animate-slide-up p-4 rounded-xl hover:bg-muted/50 transition-colors" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1.5">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Enhanced */}
        <section className="py-16 sm:py-24 px-4 relative">
          <div className="absolute inset-0 bg-muted/30" />
          <div className="container mx-auto relative">
            <div className="text-center mb-12 sm:mb-16">
              <Badge variant="outline" className="mb-4">
                <Zap className="h-3 w-3 mr-1" />
                Simpel
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t.howItWorks}</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
                <div key={index} className="text-center animate-slide-up relative" style={{ animationDelay: `${index * 0.15}s` }}>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-glow">
                    {step.step}
                  </div>
                  <step.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

          <div className="container mx-auto text-center relative">
            <div className="max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-6">
                <Sparkles className="h-3 w-3 mr-1" />
                Klaar om te beginnen?
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                {t.readyToStart}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t.joinLearners}
              </p>
              <a href={getLoginUrl()} className="inline-block">
                <Button size="lg" className="gap-2 shadow-glow text-lg py-6 px-8">
                  <Sparkles className="h-5 w-5" />
                  {t.startLearningNow}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                🎉 Gratis account • Geen creditcard nodig • Direct beginnen
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-4 glass">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-bold gradient-text">StaatsKlaar</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 StaatsKlaar. {t.staatsexamenPrep} - Built with ❤️ for immigrants in the Netherlands.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
