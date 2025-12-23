import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination } = await req.json();

    if (!origin || !destination) {
      console.error('Origin and destination are required');
      return new Response(
        JSON.stringify({ error: 'Origin and destination are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calculating distance from "${origin}" to "${destination}"`);

    // Use Google Maps Distance Matrix API
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.append('origins', origin);
    url.searchParams.append('destinations', destination);
    url.searchParams.append('key', googleMapsApiKey!);
    url.searchParams.append('units', 'metric');

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('Distance Matrix API response:', JSON.stringify(data));

    if (data.status !== 'OK') {
      console.error('Google Maps API error:', data.status);
      return new Response(
        JSON.stringify({ error: 'Failed to calculate distance. Please check addresses.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const element = data.rows[0]?.elements[0];
    
    if (element.status !== 'OK') {
      console.error('Route not found:', element.status);
      return new Response(
        JSON.stringify({ error: 'Could not find a route between these locations.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const distanceInMeters = element.distance.value;
    const distanceInKm = distanceInMeters / 1000;
    const durationInSeconds = element.duration.value;
    const durationInMinutes = Math.ceil(durationInSeconds / 60);

    console.log(`Distance: ${distanceInKm} km, Duration: ${durationInMinutes} minutes`);

    return new Response(
      JSON.stringify({
        distance: {
          value: distanceInKm,
          text: element.distance.text,
        },
        duration: {
          value: durationInMinutes,
          text: element.duration.text,
        },
        originAddress: data.origin_addresses[0],
        destinationAddress: data.destination_addresses[0],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in calculate-distance function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
