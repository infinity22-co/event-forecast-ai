import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CloudSun, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import EventAnalysis from "@/components/EventAnalysis";
import EventHistory from "@/components/EventHistory";
import AuthForm from "@/components/AuthForm";

const Index = () => {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!eventName || !eventType || !eventDate || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-weather', {
        body: {
          eventName,
          eventType,
          eventDate: format(eventDate, 'yyyy-MM-dd'),
          location,
        },
      });

      if (error) throw error;

      setAnalysis(data.analysis);

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('events').insert({
          user_id: user.id,
          event_name: eventName,
          event_type: eventType,
          event_date: format(eventDate, 'yyyy-MM-dd'),
          location,
          weather_analysis: data.analysis,
          recommendation: data.analysis.recommendation,
          precautions: data.analysis.precautions,
          status: data.analysis.status,
        });
      }

      toast({
        title: "Analysis Complete!",
        description: "Your event weather analysis is ready.",
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze weather. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-16 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDIwMCwgOTAlLCA1MCUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex justify-center mb-6">
              <CloudSun className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Weather Wise Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered weather analysis for perfect event planning
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Input Form */}
          <Card className="shadow-xl border-primary/20 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-br from-card to-secondary/30">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Plan Your Event
              </CardTitle>
              <CardDescription>Enter event details for AI weather analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  placeholder="e.g., Summer Wedding, Corporate Conference"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  placeholder="e.g., Outdoor, Indoor, Sports"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-primary/30",
                        !eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={setEventDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, Central Park"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Weather...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Weather
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-8">
            {analysis && <EventAnalysis analysis={analysis} />}
            <EventHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;