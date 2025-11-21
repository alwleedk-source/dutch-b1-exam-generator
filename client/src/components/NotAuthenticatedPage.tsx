import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, LogIn, ArrowRight } from "lucide-react";

interface NotAuthenticatedPageProps {
  message?: string;
}

export function NotAuthenticatedPage({ message }: NotAuthenticatedPageProps) {
  const { t } = useLanguage();

  const handleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {t.notAuthenticated || "Not Authenticated"}
            </CardTitle>
            <CardDescription className="text-base">
              {message || t.pleaseLoginToAccess || "Please log in to access this page"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            size="lg"
            className="w-full group"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {t.loginWithGoogle || "Login with Google"}
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>{t.dontHaveAccount || "Don't have an account?"}</p>
            <p className="mt-1">
              {t.signUpAutomatically || "Sign up automatically when you log in for the first time"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
