import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
// Eager load critical pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

// Lazy load non-critical pages
const CreateExam = lazy(() => import("./pages/CreateExam"));
const TakeExam = lazy(() => import("./pages/TakeExam"));
const Progress = lazy(() => import("./pages/Progress"));
const Vocabulary = lazy(() => import("./pages/Vocabulary"));
const VocabularySimple = lazy(() => import("./pages/VocabularySimple"));
const Dictionary = lazy(() => import("./pages/Dictionary"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const StudyMode = lazy(() => import("./pages/StudyMode"));
const ReviewPractice = lazy(() => import("./pages/ReviewPractice"));
const MyExams = lazy(() => import("./pages/MyExams"));
const PublicExams = lazy(() => import("./pages/PublicExams"));
const ExamResults = lazy(() => import("./pages/ExamResults"));
const ExamReview = lazy(() => import("./pages/ExamReview"));
const ForumHome = lazy(() => import("./pages/forum/ForumHome"));
const ForumCategory = lazy(() => import("./pages/forum/ForumCategory"));
const ForumTopic = lazy(() => import("./pages/forum/ForumTopic"));
const NewTopic = lazy(() => import("./pages/forum/NewTopic"));
const ForumReports = lazy(() => import("./pages/forum/ForumReports"));
const ModeratorPanel = lazy(() => import("./pages/forum/ModeratorPanel"));
const ForumUsers = lazy(() => import("./pages/forum/ForumUsers"));
const ModerationLog = lazy(() => import("./pages/forum/ModerationLog"));
const ModerationDashboard = lazy(() => import("./pages/forum/ModerationDashboard"));
import LanguageSelector from "./components/LanguageSelector";
import { OnboardingTour } from "./components/OnboardingTour";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/create-exam" component={CreateExam} />
        <Route path="/exam/:id" component={TakeExam} />
        <Route path="/exam/:id/results" component={ExamResults} />
        <Route path="/exam/:id/review" component={ExamReview} />
        <Route path="/progress" component={Progress} />
        <Route path="/vocabulary" component={Vocabulary} />
        <Route path="/vocabulary/simple" component={VocabularySimple} />
        <Route path="/dictionary" component={Dictionary} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/study/:examId" component={StudyMode} />
        <Route path="/review" component={ReviewPractice} />
        <Route path="/my-exams">{() => { window.location.href = '/public-exams?tab=completed'; return null; }}</Route>
        <Route path="/public-exams" component={PublicExams} />
        <Route path="/forum" component={ForumHome} />
        <Route path="/forum/category/:id" component={ForumCategory} />
        <Route path="/forum/topic/:id" component={ForumTopic} />
        <Route path="/forum/new-topic" component={NewTopic} />
        <Route path="/forum/reports" component={ForumReports} />
        <Route path="/forum/moderator" component={ModeratorPanel} />
        <Route path="/forum/users" component={ForumUsers} />
        <Route path="/forum/moderation-log" component={ModerationLog} />
        <Route path="/forum/moderation-dashboard" component={ModerationDashboard} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const { user } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user needs to select language
    const hasLanguage = user?.preferred_language || localStorage.getItem('preferredLanguage');
    if (!hasLanguage) {
      setShowLanguageSelector(true);
    }
  }, [user]);

  useEffect(() => {
    // Show onboarding for logged-in users who haven't seen it yet
    if (user && !showLanguageSelector) {
      const hasSeenOnboarding = user.has_seen_onboarding || localStorage.getItem('has_seen_onboarding') === 'true';
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, showLanguageSelector]);

  const handleLanguageSelected = (language: string) => {
    setShowLanguageSelector(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="light" switchable>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <LanguageSelector
                open={showLanguageSelector}
                onLanguageSelected={handleLanguageSelected}
              />
              <OnboardingTour
                open={showOnboarding}
                onComplete={handleOnboardingComplete}
              />
              <Router />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
