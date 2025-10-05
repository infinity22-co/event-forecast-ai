import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventName, eventType, eventDate, location } = await req.json();

    console.log('Analyzing weather for:', { eventName, eventType, eventDate, location });

    const systemPrompt = `You are a weather analysis AI assistant specialized in event planning. 
    You analyze weather conditions for specific dates and locations to provide event recommendations.
    
    Your responses must be in JSON format with the following structure:
    {
      "status": "favorable" | "unfavorable" | "caution",
      "recommendation": "Clear recommendation text",
      "precautions": ["precaution1", "precaution2", ...],
      "weatherSummary": "Brief weather summary",
      "temperature": "Expected temperature range",
      "conditions": "Weather conditions"
    }
    
    Status meanings:
    - favorable: Weather is good, event can proceed without concerns
    - caution: Weather is manageable but requires specific precautions - ALWAYS provide detailed precautions array
    - unfavorable: Weather is poor, recommend postponing or changing date
    
    IMPORTANT: When status is "caution", you MUST provide at least 3-5 specific, actionable precautions.
    `;

    const userPrompt = `Analyze the weather conditions for the following event:
    Event: ${eventName}
    Type: ${eventType}
    Date: ${eventDate}
    Location: ${location}
    
    Provide a comprehensive analysis including whether the event should proceed, any precautions needed, and alternative date suggestions if weather is unfavorable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    console.log('Analysis completed:', analysis);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in analyze-weather function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});