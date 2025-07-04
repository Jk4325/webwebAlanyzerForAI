import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon, Search, Download, Plus, Check } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { translations } from "@/lib/translations";
import { AnalysisForm } from "@/components/AnalysisForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { PaymentSection } from "@/components/PaymentSection";
import { DetailedAnalysisResults } from "@shared/schema";
import {
  createAnalysis,
  startAnalysis,
  getAnalysis,
  updateAnalysisConsent,
  processPayment,
  downloadPDF,
  sendEmail,
} from "@/lib/websiteAnalysis";
import { useToast } from "@/hooks/use-toast";

type PageState = "form" | "loading" | "results" | "success";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];

  const [pageState, setPageState] = useState<PageState>("form");
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<DetailedAnalysisResults | null>(null);

  // Create analysis mutation
  const createAnalysisMutation = useMutation({
    mutationFn: ({ url, email }: { url: string; email: string }) => createAnalysis(url, email),
    onSuccess: (data) => {
      setAnalysisId(data.id);
      setPageState("loading");
      startAnalysisMutation.mutate(data.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: t.analysisError,
        variant: "destructive",
      });
    },
  });

  // Start analysis mutation
  const startAnalysisMutation = useMutation({
    mutationFn: (id: number) => startAnalysis(id),
    onSuccess: (data) => {
      setAnalysisResults(data.results);
      setPageState("results");
    },
    onError: () => {
      toast({
        title: "Error",
        description: t.analysisError,
        variant: "destructive",
      });
      setPageState("form");
    },
  });

  // Update consent mutation
  const updateConsentMutation = useMutation({
    mutationFn: (consents: {
      termsAccepted: boolean;
      privacyAccepted: boolean;
      dataAccepted: boolean;
    }) => updateAnalysisConsent(analysisId!, consents),
    onError: () => {
      toast({
        title: "Error",
        description: t.allConsentsRequired,
        variant: "destructive",
      });
    },
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (paymentIntentId: string) => {
      return fetch(`/api/analyses/${analysisId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      setPageState("success");
      sendEmailMutation.mutate();
    },
    onError: () => {
      toast({
        title: "Error",
        description: t.paymentError,
        variant: "destructive",
      });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: () => sendEmail(analysisId!),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email sent successfully!",
      });
    },
  });

  // Download PDF mutation
  const downloadPDFMutation = useMutation({
    mutationFn: () => downloadPDF(analysisId!, language),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `website-analysis-${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: { url: string; email: string }) => {
    createAnalysisMutation.mutate(data);
  };

  const handlePayment = (consents: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    dataAccepted: boolean;
  }) => {
    updateConsentMutation.mutate(consents);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    processPaymentMutation.mutate(paymentIntentId);
  };

  const handleNewAnalysis = () => {
    setPageState("form");
    setAnalysisId(null);
    setAnalysisResults(null);
  };

  const handleDownloadPDF = () => {
    downloadPDFMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">
                <Search className="inline mr-2 h-6 w-6 text-primary" />
                {t.appTitle}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="flex items-center bg-secondary rounded-lg p-1">
                <Button
                  variant={language === "cs" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLanguage("cs")}
                  className="h-8 px-3 text-xs"
                >
                  {t.languageCs}
                </Button>
                <Button
                  variant={language === "en" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className="h-8 px-3 text-xs"
                >
                  {t.languageEn}
                </Button>
              </div>
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-8 w-8 p-0"
              >
                {theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {pageState === "form" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                {t.heroTitle}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t.heroSubtitle}
              </p>
            </div>

            <AnalysisForm
              onSubmit={handleFormSubmit}
              isLoading={createAnalysisMutation.isPending}
            />
          </div>
        )}

        {pageState === "loading" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t.analyzingTitle}
                  </h3>
                  <p className="text-muted-foreground">
                    {t.analyzingSubtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {pageState === "results" && analysisResults && (
          <div className="max-w-6xl mx-auto space-y-8">
            <AnalysisResults results={analysisResults} />
            <PaymentSection
              analysisId={analysisId!}
              onPayment={handlePayment}
              onPaymentSuccess={handlePaymentSuccess}
              isLoading={updateConsentMutation.isPending || processPaymentMutation.isPending}
            />
          </div>
        )}

        {pageState === "success" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {t.successTitle}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t.successSubtitle}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={downloadPDFMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t.downloadPdfButton}
                  </Button>
                  <Button
                    onClick={handleNewAnalysis}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t.newAnalysisButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">{t.footerText}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
