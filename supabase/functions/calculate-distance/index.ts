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
    const { originLat, originLon, destLat, destLon } = await req.json();

    if (!originLat || !originLon || !destLat || !destLon) {
      return new Response(
        JSON.stringify({ error: 'Origin and destination coordinates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OSRM route: (${originLat},${originLon}) -> (${destLat},${destLon})`);

    // Use OSRM (free, no API key needed)
    const url = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      console.error('OSRM error:', data);
      return new Response(
        JSON.stringify({ error: 'Could not find a route between these locations.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const route = data.routes[0];
    const distanceInKm = route.distance / 1000;
    const durationInMinutes = Math.ceil(route.duration / 60);

    console.log(`Distance: ${distanceInKm.toFixed(1)} km, Duration: ${durationInMinutes} min`);

    return new Response(
      JSON.stringify({
        distance: {
          value: Math.round(distanceInKm * 10) / 10,
          text: `${distanceInKm.toFixed(1)} km`,
        },
        duration: {
          value: durationInMinutes,
          text: durationInMinutes < 60
            ? `${durationInMinutes} mins`
            : `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m`,
        },
        routeGeometry: route.geometry,
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
