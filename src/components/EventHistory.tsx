import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Package } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Event {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  location: string;
  status: "favorable" | "unfavorable" | "caution";
  created_at: string;
}

const EventHistory = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setEvents(data as Event[]);
      }
      setIsLoading(false);
    };

    fetchEvents();

    // Subscribe to changes
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "favorable":
        return <Badge className="bg-success hover:bg-success/90 text-xs">Favorable</Badge>;
      case "caution":
        return <Badge className="bg-accent hover:bg-accent/90 text-xs">Caution</Badge>;
      case "unfavorable":
        return <Badge className="bg-destructive hover:bg-destructive/90 text-xs">Unfavorable</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle>Event History</CardTitle>
          <CardDescription>Loading your past analyses...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle>Event History</CardTitle>
          <CardDescription>Your analyzed events will appear here</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No events analyzed yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-primary/20">
      <CardHeader>
        <CardTitle>Event History</CardTitle>
        <CardDescription>Recently analyzed events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border border-primary/10 bg-secondary/30 hover:bg-secondary/50 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold">{event.event_name}</h4>
                  {getStatusBadge(event.status)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-primary" />
                    {event.event_type}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-primary" />
                    {format(new Date(event.event_date), 'PPP')}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventHistory;