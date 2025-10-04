import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, CloudRain, Thermometer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EventAnalysisProps {
  analysis: {
    status: "favorable" | "unfavorable" | "caution";
    recommendation: string;
    precautions?: string[];
    weatherSummary?: string;
    temperature?: string;
    conditions?: string;
  };
}

const EventAnalysis = ({ analysis }: EventAnalysisProps) => {
  const getStatusIcon = () => {
    switch (analysis.status) {
      case "favorable":
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      case "caution":
        return <AlertTriangle className="w-6 h-6 text-accent" />;
      case "unfavorable":
        return <AlertCircle className="w-6 h-6 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    switch (analysis.status) {
      case "favorable":
        return <Badge className="bg-success hover:bg-success/90">Favorable</Badge>;
      case "caution":
        return <Badge className="bg-accent hover:bg-accent/90">Caution</Badge>;
      case "unfavorable":
        return <Badge className="bg-destructive hover:bg-destructive/90">Unfavorable</Badge>;
    }
  };

  return (
    <Card className="shadow-xl border-primary/20 animate-fade-in">
      <CardHeader className="bg-gradient-to-br from-card to-secondary/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Weather Analysis
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>AI-powered event recommendation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Alert className={
          analysis.status === "favorable" ? "border-success/50 bg-success/10" :
          analysis.status === "caution" ? "border-accent/50 bg-accent/10" :
          "border-destructive/50 bg-destructive/10"
        }>
          <AlertTitle className="font-semibold">Recommendation</AlertTitle>
          <AlertDescription className="mt-2">{analysis.recommendation}</AlertDescription>
        </Alert>

        {analysis.weatherSummary && (
          <div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CloudRain className="w-4 h-4 text-primary" />
              Weather Summary
            </div>
            <p className="text-sm text-muted-foreground">{analysis.weatherSummary}</p>
          </div>
        )}

        {analysis.temperature && (
          <div className="space-y-2 p-4 rounded-lg bg-secondary/30 border border-primary/10">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Thermometer className="w-4 h-4 text-primary" />
              Expected Temperature
            </div>
            <p className="text-sm text-muted-foreground">{analysis.temperature}</p>
          </div>
        )}

        {analysis.precautions && analysis.precautions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" />
              Recommended Precautions
            </h4>
            <ul className="space-y-2">
              {analysis.precautions.map((precaution, index) => (
                <li key={index} className="flex items-start gap-2 text-sm p-3 rounded-md bg-accent/10 border border-accent/20">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>{precaution}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventAnalysis;