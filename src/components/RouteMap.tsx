import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  pickupCoords?: { lat: number; lon: number } | null;
  dropCoords?: { lat: number; lon: number } | null;
  routeGeometry?: any;
  currentLocation?: { lat: number; lon: number } | null;
}

const RouteMap = ({ pickupCoords, dropCoords, routeGeometry, currentLocation }: RouteMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pickupMarkerRef = useRef<L.CircleMarker | null>(null);
  const dropMarkerRef = useRef<L.CircleMarker | null>(null);
  const currentLocMarkerRef = useRef<L.CircleMarker | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([20.5937, 78.9629], 5); // India center

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution('© <a href="https://osm.org/copyright">OSM</a>')
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers and route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    if (pickupMarkerRef.current) { pickupMarkerRef.current.remove(); pickupMarkerRef.current = null; }
    if (dropMarkerRef.current) { dropMarkerRef.current.remove(); dropMarkerRef.current = null; }
    if (currentLocMarkerRef.current) { currentLocMarkerRef.current.remove(); currentLocMarkerRef.current = null; }
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }

    const bounds: L.LatLngExpression[] = [];

    // Current location marker (blue pulse)
    if (currentLocation) {
      currentLocMarkerRef.current = L.circleMarker([currentLocation.lat, currentLocation.lon], {
        radius: 8, fillColor: '#3b82f6', fillOpacity: 0.9, color: '#fff', weight: 3,
      }).addTo(map).bindTooltip("You", { permanent: false });
    }

    // Pickup marker (green)
    if (pickupCoords) {
      pickupMarkerRef.current = L.circleMarker([pickupCoords.lat, pickupCoords.lon], {
        radius: 10, fillColor: 'hsl(142, 70%, 45%)', fillOpacity: 1, color: '#fff', weight: 3,
      }).addTo(map).bindTooltip("Pickup", { permanent: true, direction: 'top', className: 'map-tooltip' });
      bounds.push([pickupCoords.lat, pickupCoords.lon]);
    }

    // Drop marker (orange)
    if (dropCoords) {
      dropMarkerRef.current = L.circleMarker([dropCoords.lat, dropCoords.lon], {
        radius: 10, fillColor: 'hsl(24, 95%, 53%)', fillOpacity: 1, color: '#fff', weight: 3,
      }).addTo(map).bindTooltip("Drop", { permanent: true, direction: 'top', className: 'map-tooltip' });
      bounds.push([dropCoords.lat, dropCoords.lon]);
    }

    // Route line
    if (routeGeometry) {
      routeLayerRef.current = L.geoJSON(routeGeometry, {
        style: { color: 'hsl(174, 60%, 35%)', weight: 5, opacity: 0.8 },
      }).addTo(map);
    }

    // Fit bounds
    if (bounds.length === 2) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0] as L.LatLngExpression, 14);
    } else if (currentLocation) {
      map.setView([currentLocation.lat, currentLocation.lon], 14);
    }
  }, [pickupCoords, dropCoords, routeGeometry, currentLocation]);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-border shadow-card">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default RouteMap;
