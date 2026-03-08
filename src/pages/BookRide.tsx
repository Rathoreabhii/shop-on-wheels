import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bike, Truck, Package, ArrowRight, Calculator, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import VehicleCard from "@/components/VehicleCard";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import RouteMap from "@/components/RouteMap";
import { vehicles } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const vehicleIcons = {
  auto: Bike,
  tempo: Truck,
  "mini-truck": Package,
};

const mockDrivers = [
  { name: "Ramesh Kumar", phone: "+91 98765 43210", vehicleNumber: "DL 4C AB 1234", rating: 4.8 },
  { name: "Suresh Sharma", phone: "+91 98765 54321", vehicleNumber: "DL 3C XY 5678", rating: 4.6 },
  { name: "Vikram Singh", phone: "+91 98765 65432", vehicleNumber: "DL 2C MN 9012", rating: 4.9 },
];

interface DistanceResult {
  distance: { value: number; text: string };
  duration: { value: number; text: string };
  routeGeometry?: any;
}

interface Coords {
  lat: number;
  lon: number;
}

const BookRide = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coords | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [distanceResult, setDistanceResult] = useState<DistanceResult | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get current location - called directly from user click
  const useCurrentLocationForPickup = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Location unavailable", description: "Your browser doesn't support geolocation", variant: "destructive" });
      return;
    }

    toast({ title: "📍 Locating...", description: "Getting your current position" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCurrentLocation(coords);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`,
            { headers: { 'User-Agent': 'LODR-App/1.0' } }
          );
          const data = await res.json();
          const address = data.display_name || `${coords.lat}, ${coords.lon}`;
          setPickup(address);
          setPickupCoords(coords);
          toast({ title: "📍 Location set", description: "Using your current location as pickup" });
        } catch {
          setPickup(`${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
          setPickupCoords(coords);
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          toast({ title: "Permission denied", description: "Please allow location access in your browser settings", variant: "destructive" });
        } else {
          toast({ title: "Location unavailable", description: "Could not determine your position. Please try again.", variant: "destructive" });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [toast]);

  // Calculate distance when both coords are set
  useEffect(() => {
    if (!pickupCoords || !dropCoords) {
      setDistanceResult(null);
      return;
    }

    const calculate = async () => {
      setIsCalculating(true);
      try {
        const { data, error } = await supabase.functions.invoke('calculate-distance', {
          body: {
            originLat: pickupCoords.lat,
            originLon: pickupCoords.lon,
            destLat: dropCoords.lat,
            destLon: dropCoords.lon,
          }
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        setDistanceResult(data);
      } catch (err: any) {
        console.error('Distance calculation failed:', err);
        setDistanceResult(null);
      } finally {
        setIsCalculating(false);
      }
    };

    calculate();
  }, [pickupCoords, dropCoords]);

  const calculateFare = () => {
    if (!selectedVehicle || !distanceResult) return null;
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    if (!vehicle) return null;
    const distance = distanceResult.distance.value;
    const fare = Math.round(vehicle.baseFare + distance * vehicle.perKm);
    return { fare, distance, baseFare: vehicle.baseFare, perKm: vehicle.perKm, duration: distanceResult.duration.text };
  };

  const fareDetails = calculateFare();

  const handlePickupChange = (value: string, coords?: { lat: number; lon: number }) => {
    setPickup(value);
    if (coords) setPickupCoords(coords);
    else setPickupCoords(null);
  };

  const handleDropChange = (value: string, coords?: { lat: number; lon: number }) => {
    setDrop(value);
    if (coords) setDropCoords(coords);
    else setDropCoords(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickup.trim()) { toast({ title: "Missing pickup location", description: "Please enter a pickup location", variant: "destructive" }); return; }
    if (!drop.trim()) { toast({ title: "Missing drop location", description: "Please enter a drop location", variant: "destructive" }); return; }
    if (!selectedVehicle) { toast({ title: "No vehicle selected", description: "Please select a vehicle type", variant: "destructive" }); return; }
    if (!distanceResult) { toast({ title: "Calculating distance", description: "Please wait while we calculate the distance", variant: "destructive" }); return; }
    if (!user) { toast({ title: "Please login", description: "You need to be logged in to book a ride", variant: "destructive" }); navigate("/auth"); return; }

    setIsSubmitting(true);
    try {
      const driver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
      const vehicleName = vehicles.find(v => v.id === selectedVehicle)?.name || selectedVehicle;

      const { data, error } = await supabase
        .from("rides")
        .insert({
          user_id: user.id,
          pickup: pickup.trim(),
          drop_location: drop.trim(),
          vehicle_type: vehicleName,
          fare: fareDetails?.fare || 0,
          status: "requested",
          driver_name: driver.name,
          driver_phone: driver.phone,
          vehicle_number: driver.vehicleNumber,
          driver_rating: driver.rating,
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Ride requested!", description: "Finding nearby drivers for you..." });
      navigate("/ride-status", { state: { rideId: data.id } });
    } catch (error: any) {
      toast({ title: "Failed to book ride", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Book a Ride</h1>
            <p className="mt-1 text-muted-foreground">Enter your locations and choose a vehicle</p>
          </div>

          {/* Map Preview */}
          <div className="mb-6 animate-fade-in">
            <RouteMap
              pickupCoords={pickupCoords}
              dropCoords={dropCoords}
              routeGeometry={distanceResult?.routeGeometry}
              currentLocation={currentLocation}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 rounded-xl bg-card border border-border shadow-card mb-6 animate-slide-up">
              <h2 className="font-semibold text-foreground mb-4">Where to?</h2>
              <div className="space-y-4">
                <PlacesAutocomplete
                  value={pickup}
                  onChange={handlePickupChange}
                  placeholder="Pickup Location"
                  icon="pickup"
                  showCurrentLocation
                  onUseCurrentLocation={useCurrentLocationForPickup}
                />
                <PlacesAutocomplete
                  value={drop}
                  onChange={handleDropChange}
                  placeholder="Drop Location"
                  icon="drop"
                />
              </div>

              {(isCalculating || distanceResult) && (
                <div className="mt-4 pt-4 border-t border-border">
                  {isCalculating ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Calculating route...</span>
                    </div>
                  ) : distanceResult ? (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{distanceResult.distance.text}</span>
                      </div>
                      <span className="text-muted-foreground">~{distanceResult.duration.text}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Vehicle Selection */}
            <div className="mb-6 animate-slide-up" style={{ animationDelay: "50ms" }}>
              <h2 className="font-semibold text-foreground mb-4">Select Vehicle</h2>
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    name={vehicle.name}
                    icon={vehicleIcons[vehicle.id as keyof typeof vehicleIcons]}
                    baseFare={vehicle.baseFare}
                    capacity={vehicle.capacity}
                    isSelected={selectedVehicle === vehicle.id}
                    onSelect={() => setSelectedVehicle(vehicle.id)}
                  />
                ))}
              </div>
            </div>

            {/* Fare Estimate */}
            {fareDetails && (
              <div className="p-6 rounded-xl bg-secondary/50 border border-border mb-6 animate-scale-in">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Fare Estimate</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span className="text-foreground">₹{fareDetails.baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance ({fareDetails.distance.toFixed(1)} km × ₹{fareDetails.perKm})</span>
                    <span className="text-foreground">₹{Math.round(fareDetails.distance * fareDetails.perKm)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated time</span>
                    <span>{fareDetails.duration}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="font-semibold text-foreground">Total Estimate</span>
                    <span className="text-xl font-bold text-primary">₹{fareDetails.fare}</span>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" variant="accent" size="xl" className="w-full animate-slide-up" style={{ animationDelay: "100ms" }} disabled={isSubmitting || isCalculating || !distanceResult}>
              {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Booking...</>) : (<>Request Ride<ArrowRight className="w-5 h-5" /></>)}
            </Button>

            {!user && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                You'll need to{" "}
                <button type="button" onClick={() => navigate("/auth")} className="text-primary hover:underline">login or create an account</button>{" "}
                to book a ride
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookRide;
