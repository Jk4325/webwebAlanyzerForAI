import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailedAnalysisResults } from "@shared/schema";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";

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

  const analysisAreas = [
    {
      name: t.htmlStructure,
      score: results.htmlStructure.score,
      methodology: results.htmlStructure.methodology[language],
    },
    {
      name: t.metadata,
      score: results.metadata.score,
      methodology: results.metadata.methodology[language],
    },
    {
      name: t.schema,
      score: results.schema.score,
      methodology: results.schema.methodology[language],
    },
    {
      name: t.contentWithoutJs,
      score: results.contentWithoutJs.score,
      methodology: results.contentWithoutJs.methodology[language],
    },
    {
      name: t.sitemapRobots,
      score: results.sitemapRobots.score,
      methodology: results.sitemapRobots.methodology[language],
    },
    {
      name: t.accessibility,
      score: results.accessibility.score,
      methodology: results.accessibility.methodology[language],
    },
    {
      name: t.speed,
      score: results.speed.score,
      methodology: results.speed.methodology[language],
    },
    {
      name: t.readability,
      score: results.readability.score,
      methodology: results.readability.methodology[language],
    },
    {
      name: t.internalLinking,
      score: results.internalLinking.score,
      methodology: results.internalLinking.methodology[language],
    },
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold mb-4">{t.resultsTitle}</CardTitle>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-bold text-primary">{results.totalScore}</span>
          <span className="text-lg text-muted-foreground">{t.totalScoreLabel}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisAreas.map((area) => (
            <div key={area.name} className="bg-secondary/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">{area.name}</h4>
                <span className={`text-2xl font-bold ${getScoreColor(area.score)}`}>
                  {area.score}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{area.methodology}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
