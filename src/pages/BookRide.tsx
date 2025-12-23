import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Bike, Truck, Package, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import VehicleCard from "@/components/VehicleCard";
import { vehicles } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const vehicleIcons = {
  auto: Bike,
  tempo: Truck,
  "mini-truck": Package,
};

const BookRide = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Static fare calculation (mock)
  const calculateFare = () => {
    if (!selectedVehicle) return null;
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    if (!vehicle) return null;

    // Mock distance calculation (5-15 km)
    const mockDistance = 8;
    const fare = vehicle.baseFare + mockDistance * vehicle.perKm;
    return { fare, distance: mockDistance, baseFare: vehicle.baseFare, perKm: vehicle.perKm };
  };

  const fareDetails = calculateFare();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickup.trim()) {
      toast({
        title: "Missing pickup location",
        description: "Please enter a pickup location",
        variant: "destructive",
      });
      return;
    }

    if (!drop.trim()) {
      toast({
        title: "Missing drop location",
        description: "Please enter a drop location",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVehicle) {
      toast({
        title: "No vehicle selected",
        description: "Please select a vehicle type",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ride requested!",
      description: "Finding nearby drivers for you...",
    });

    navigate("/ride-status");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Book a Ride</h1>
            <p className="mt-1 text-muted-foreground">
              Enter your locations and choose a vehicle
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Location Inputs */}
            <div className="p-6 rounded-xl bg-card border border-border shadow-card mb-6 animate-slide-up">
              <h2 className="font-semibold text-foreground mb-4">Where to?</h2>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-success" />
                  <Input
                    type="text"
                    placeholder="Pickup Location"
                    className="pl-10 h-12"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent" />
                  <Input
                    type="text"
                    placeholder="Drop Location"
                    className="pl-10 h-12"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                  />
                </div>
              </div>
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
              <div
                className="p-6 rounded-xl bg-secondary/50 border border-border mb-6 animate-scale-in"
              >
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
                    <span className="text-muted-foreground">
                      Distance ({fareDetails.distance} km × ₹{fareDetails.perKm})
                    </span>
                    <span className="text-foreground">
                      ₹{fareDetails.distance * fareDetails.perKm}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <span className="font-semibold text-foreground">Total Estimate</span>
                    <span className="text-xl font-bold text-primary">₹{fareDetails.fare}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="accent"
              size="xl"
              className="w-full animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              Request Ride
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookRide;
