import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import TakeExam from "./pages/TakeExam";
import Progress from "./pages/Progress";
import Vocabulary from "./pages/Vocabulary";
import AdminDashboard from "./pages/AdminDashboard";
import Leaderboard from "./pages/Leaderboard";
import Achievements from "./pages/Achievements";
import StudyMode from "./pages/StudyMode";
import ReviewPractice from "./pages/ReviewPractice";
import MyExams from "./pages/MyExams";
import PublicExams from "./pages/PublicExams";
import ExamResults from "./pages/ExamResults";
import ExamReview from "./pages/ExamReview";
import LanguageSelector from "./components/LanguageSelector";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-exam" component={CreateExam} />
      <Route path="/exam/:id" component={TakeExam} />
      <Route path="/exam/:id/results" component={ExamResults} />
      <Route path="/exam/:id/review" component={ExamReview} />
      <Route path="/progress" component={Progress} />
      <Route path="/vocabulary" component={Vocabulary} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/study/:examId" component={StudyMode} />
      <Route path="/review" component={ReviewPractice} />
      <Route path="/my-exams" component={MyExams} />
      <Route path="/public-exams" component={PublicExams} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  useEffect(() => {
    // Check if user needs to select language
    const hasLanguage = user?.preferred_language || localStorage.getItem('preferredLanguage');
    if (!hasLanguage) {
      setShowLanguageSelector(true);
    }
  }, [user]);
  
  const handleLanguageSelected = (language: string) => {
    setShowLanguageSelector(false);
  };
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <LanguageSelector 
              open={showLanguageSelector} 
              onLanguageSelected={handleLanguageSelected} 
            />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
