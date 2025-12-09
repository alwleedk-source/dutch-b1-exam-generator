import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { BookOpen, Library, GraduationCap, MessageSquare, Sparkles } from "lucide-react";

interface OnboardingTourProps {
    open: boolean;
    onComplete: () => void;
}

const TOTAL_STEPS = 5;

export function OnboardingTour({ open, onComplete }: OnboardingTourProps) {
    const { t, language } = useLanguage();
    const [currentStep, setCurrentStep] = useState(0);

    const completeOnboardingMutation = trpc.auth.completeOnboarding.useMutation({
        onSuccess: () => {
            onComplete();
        },
        onError: () => {
            // Still complete if there's an error, we'll save in localStorage as backup
            localStorage.setItem("has_seen_onboarding", "true");
            onComplete();
        },
    });

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete onboarding
            completeOnboardingMutation.mutate();
            localStorage.setItem("has_seen_onboarding", "true");
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        completeOnboardingMutation.mutate();
        localStorage.setItem("has_seen_onboarding", "true");
    };

    const isRTL = language === "ar";

    const steps = [
        {
            icon: GraduationCap,
            title: t.onboardingStep1Title || "مرحباً بك في StaatKlaar!",
            description: t.onboardingStep1Desc || "منصتك للتحضير لامتحان القراءة الرسمي B1 الهولندي",
        },
        {
            icon: BookOpen,
            title: t.onboardingStep2Title || "اختبارات جاهزة للتدريب",
            description: t.onboardingStep2Desc || "نضيف نصوص جديدة يومياً بمستوى B1 لتتدرب عليها",
        },
        {
            icon: Library,
            title: t.onboardingStep3Title || "ابنِ قائمة مفرداتك",
            description: t.onboardingStep3Desc || "أضف كلمات من النصوص أثناء القراءة أو من القاموس مباشرة، ثم تدرب عليها!",
        },
        {
            icon: Sparkles,
            title: t.onboardingStep4Title || "تدرب بطرق مختلفة",
            description: t.onboardingStep4Desc || "بطاقات تعليمية (Flashcards)، اختبارات سريعة، والتكرار المتباعد الذكي",
        },
        {
            icon: MessageSquare,
            title: t.onboardingStep5Title || "تواصل مع الآخرين",
            description: t.onboardingStep5Desc || "شارك تجربتك واسأل أسئلتك في المنتدى بلغتك المفضلة",
        },
    ];

    const currentStepData = steps[currentStep];
    const Icon = currentStepData.icon;

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        {currentStepData.description}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 py-4">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                    ? "bg-primary w-4"
                                    : index < currentStep
                                        ? "bg-primary/50"
                                        : "bg-muted"
                                }`}
                        />
                    ))}
                </div>

                <DialogFooter className={`flex ${isRTL ? "flex-row-reverse" : "flex-row"} gap-2 sm:justify-between`}>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button variant="outline" onClick={handlePrevious}>
                                {t.previous || "السابق"}
                            </Button>
                        )}
                        {currentStep === 0 && (
                            <Button variant="ghost" onClick={handleSkip}>
                                {t.skip || "تخطي"}
                            </Button>
                        )}
                    </div>
                    <Button onClick={handleNext}>
                        {currentStep === TOTAL_STEPS - 1
                            ? t.startLearningNow || "ابدأ الآن! 🚀"
                            : t.next || "التالي"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
