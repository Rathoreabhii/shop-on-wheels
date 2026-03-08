import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();

    if (!input || input.length < 3) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Nominatim autocomplete for: "${input}"`);

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', input);
    url.searchParams.append('format', 'json');
    url.searchParams.append('countrycodes', 'in');
    url.searchParams.append('limit', '5');
    url.searchParams.append('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'LODR-App/1.0' }
    });
    const data = await response.json();

    const predictions = data.map((item: any) => {
      const parts = item.display_name.split(', ');
      return {
        placeId: item.place_id.toString(),
        description: item.display_name,
        mainText: parts[0] || item.display_name,
        secondaryText: parts.slice(1, 3).join(', '),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });

    console.log(`Found ${predictions.length} suggestions`);

    return new Response(
      JSON.stringify({ predictions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in places-autocomplete function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
