import { Link, useLocation } from "react-router-dom";
import { MapPin, Phone, Star, Truck, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import StatusStepper from "@/components/StatusStepper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const RideStatus = () => {
  const location = useLocation();
  const { user } = useAuth();
  const rideId = location.state?.rideId;

  const steps = ["Requested", "Driver Assigned", "In Transit", "Completed"];

  // Fetch specific ride or latest ride
  const { data: ride, isLoading } = useQuery({
    queryKey: ["ride", rideId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      let query = supabase
        .from("rides")
        .select("*")
        .eq("user_id", user.id);

      if (rideId) {
        query = query.eq("id", rideId);
      } else {
        query = query.order("created_at", { ascending: false }).limit(1);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch all rides for history
  const { data: rideHistory = [] } = useQuery({
    queryKey: ["rideHistory", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Map status to step number
  const statusToStep: Record<string, number> = {
    requested: 1,
    assigned: 2,
    in_progress: 3,
    completed: 4,
  };

  const currentStep = ride ? statusToStep[ride.status] || 1 : 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!ride && rideHistory.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No rides yet</h2>
            <p className="text-muted-foreground mb-6">Book your first ride to get started!</p>
            <Button variant="accent" asChild>
              <Link to="/book-ride">Book a Ride</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {ride && (
            <>
              {/* Header */}
              <div className="mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ride Status</h1>
                  {currentStep === 4 && (
                    <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Booked on {new Date(ride.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Status Stepper */}
              <div className="p-6 rounded-xl bg-card border border-border shadow-card mb-6 animate-slide-up">
                <StatusStepper currentStep={currentStep} steps={steps} />
              </div>

              {/* Booking Details */}
              <div
                className="p-6 rounded-xl bg-card border border-border shadow-card mb-6 animate-slide-up"
                style={{ animationDelay: "50ms" }}
              >
                <h2 className="font-semibold text-foreground mb-4">Booking Details</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Pickup</p>
                      <p className="font-medium text-foreground">{ride.pickup}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Drop</p>
                      <p className="font-medium text-foreground">{ride.drop_location}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Vehicle</p>
                        <p className="font-medium text-foreground">{ride.vehicle_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">Fare</p>
                      <p className="text-xl font-bold text-primary">₹{ride.fare}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              {ride.driver_name && (
                <div className="p-6 rounded-xl bg-card border border-border shadow-card animate-scale-in">
                  <h2 className="font-semibold text-foreground mb-4">Driver Information</h2>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {ride.driver_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{ride.driver_name}</h3>
                        {ride.driver_rating && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-success/10 text-success rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            {ride.driver_rating}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {ride.vehicle_number}
                      </p>
                    </div>
                  </div>

                  {ride.driver_phone && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="accent" className="w-full" asChild>
                        <a href={`tel:${ride.driver_phone}`}>
                          <Phone className="w-4 h-4" />
                          Call Driver
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
                {currentStep === 4 && (
                  <Button variant="accent" className="flex-1" asChild>
                    <Link to="/book-ride">Book Another Ride</Link>
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Ride History */}
          {rideHistory.length > 1 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-foreground mb-4">Ride History</h2>
              <div className="space-y-3">
                {rideHistory.slice(1, 6).map((pastRide) => (
                  <div
                    key={pastRide.id}
                    className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.reload()}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {pastRide.pickup} → {pastRide.drop_location}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pastRide.vehicle_type} • {new Date(pastRide.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">₹{pastRide.fare}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          pastRide.status === "completed" 
                            ? "bg-success/10 text-success" 
                            : "bg-accent/10 text-accent"
                        }`}>
                          {pastRide.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RideStatus;
