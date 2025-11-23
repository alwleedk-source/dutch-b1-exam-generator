import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
}: SEOProps) {
  const { language, t } = useLanguage();

  // Default values based on language
  const defaultTitle = "StaatKlaar - Dutch B1 Staatsexamen Preparation | Practice Reading Comprehension";
  const defaultDescription =
    "Master Dutch reading comprehension for the B1 Staatsexamen. Practice with AI-generated questions, get instant feedback, and track your progress. Available in Nederlands, العربية, English, and Türkçe.";
  const defaultKeywords =
    "Dutch B1, Staatsexamen, NT2, Dutch exam, reading comprehension, Dutch practice, integration exam, inburgeringsexamen, Nederlands leren, Dutch learning, B1 niveau";
  const defaultImage = "https://staatklaar.app/og-image.png";
  const defaultUrl = "https://staatklaar.app";

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || defaultImage;
  const finalUrl = url || defaultUrl;

  // Language-specific meta tags
  const langCode = language === "ar" ? "ar" : language === "tr" ? "tr" : language === "nl" ? "nl" : "en";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={langCode} />
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="StaatKlaar" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={langCode} />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={langCode === "ar" ? "ar_SA" : langCode === "tr" ? "tr_TR" : langCode === "nl" ? "nl_NL" : "en_US"} />
      <meta property="og:site_name" content="StaatKlaar" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={finalUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#3b82f6" />
      <link rel="canonical" href={finalUrl} />

      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "StaatKlaar",
          url: "https://staatklaar.app",
          logo: "https://staatklaar.app/logo.png",
          description: finalDescription,
          sameAs: [],
        })}
      </script>

      {/* Structured Data - WebApplication */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "StaatKlaar",
          url: "https://staatklaar.app",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
          description: finalDescription,
          inLanguage: ["nl", "ar", "en", "tr"],
          featureList: [
            "AI-generated Dutch B1 exam questions",
            "Instant feedback and explanations",
            "Progress tracking and statistics",
            "Vocabulary builder with translations",
            "Practice and exam modes",
            "Multi-language support",
          ],
        })}
      </script>

      {/* Structured Data - Course */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: "Dutch B1 Staatsexamen Preparation",
          description: "Comprehensive Dutch B1 reading comprehension practice for the Staatsexamen",
          provider: {
            "@type": "Organization",
            name: "StaatKlaar",
            url: "https://staatklaar.app",
          },
          educationalLevel: "B1",
          inLanguage: "nl",
          coursePrerequisites: "Basic Dutch knowledge (A2 level)",
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: "PT10H",
          },
        })}
      </script>

      {/* Structured Data - FAQ (if applicable) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is StaatKlaar?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "StaatKlaar is an online platform for practicing Dutch B1 reading comprehension for the Staatsexamen. It uses AI to generate practice questions and provides instant feedback.",
              },
            },
            {
              "@type": "Question",
              name: "Is StaatKlaar free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, StaatKlaar is completely free to use. Create an account and start practicing immediately.",
              },
            },
            {
              "@type": "Question",
              name: "What languages does StaatKlaar support?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "StaatKlaar supports Nederlands, العربية (Arabic), English, and Türkçe (Turkish) for the interface, while all exam content is in Dutch.",
              },
            },
            {
              "@type": "Question",
              name: "How does the AI-generated exam work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You can paste any Dutch text, and our AI will generate B1-level reading comprehension questions based on that text, similar to the official Staatsexamen format.",
              },
            },
          ],
        })}
      </script>
    </Helmet>
  );
}
