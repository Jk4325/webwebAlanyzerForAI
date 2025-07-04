import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailedAnalysisResults } from "@shared/schema";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";
import { Lock, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AnalysisResultsProps {
  results: DetailedAnalysisResults;
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score >= 60) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const analysisAreas = [
    { name: t.htmlStructure, score: results.htmlStructure.score },
    { name: t.metadata, score: results.metadata.score },
    { name: t.schema, score: results.schema.score },
    { name: t.contentWithoutJs, score: results.contentWithoutJs.score },
    { name: t.sitemapRobots, score: results.sitemapRobots.score },
    { name: t.accessibility, score: results.accessibility.score },
    { name: t.speed, score: results.speed.score },
    { name: t.readability, score: results.readability.score },
    { name: t.internalLinking, score: results.internalLinking.score },
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto border-2 border-primary/20">
      <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardTitle className="text-3xl font-bold mb-6">{t.resultsTitle}</CardTitle>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {results.totalScore}%
          </span>
        </div>
        <p className="text-muted-foreground text-lg">
          {language === "cs" ? "Celkové skóre vašeho webu" : "Overall website score"}
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysisAreas.map((area) => (
            <div key={area.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground text-sm">{area.name}</h4>
                {getScoreIcon(area.score)}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-3xl font-bold ${getScoreColor(area.score)}`}>
                  {area.score}%
                </span>
                <Badge className={getScoreBadge(area.score)}>
                  {area.score >= 80 ? (language === "cs" ? "Výborné" : "Excellent") :
                   area.score >= 60 ? (language === "cs" ? "Dobré" : "Good") :
                   (language === "cs" ? "Slabé" : "Poor")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-amber-600" />
            <h3 className="text-xl font-bold text-foreground">
              {language === "cs" ? "Pro více informací zaplaťte 50 Kč" : "Pay 50 CZK for more information"}
            </h3>
          </div>
          <p className="text-muted-foreground">
            {language === "cs" ? 
              "Získejte detailní analýzu s doporučeními, metodikou a PDF reportem pro každou oblast." :
              "Get detailed analysis with recommendations, methodology and PDF report for each area."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
