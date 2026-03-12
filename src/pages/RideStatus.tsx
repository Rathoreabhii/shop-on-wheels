import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Phone, Star, Truck, ArrowLeft, CheckCircle, Search, Loader2, XCircle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import StatusStepper from "@/components/StatusStepper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const RideStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const rideId = location.state?.rideId;
  const [isCancelling, setIsCancelling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const steps = ["Pending", "Driver Assigned", "Picked Up", "Delivered"];

  // Fetch specific ride or latest active ride
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
        query = query.not("status", "in", '("delivered","cancelled")').order("created_at", { ascending: false }).limit(1);
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

  // Realtime subscription for ride updates
  useEffect(() => {
    if (!ride?.id) return;

    const channel = supabase
      .channel(`ride-${ride.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${ride.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ride", rideId, user?.id] });
          queryClient.invalidateQueries({ queryKey: ["rideHistory", user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ride?.id, rideId, user?.id, queryClient]);

  const handleCancelRide = async () => {
    if (!ride) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from("rides")
        .update({ status: "cancelled" })
        .eq("id", ride.id)
        .eq("user_id", user!.id);

      if (error) throw error;

      toast({ title: "Ride cancelled", description: "Your ride has been cancelled successfully." });
      queryClient.invalidateQueries({ queryKey: ["ride", rideId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["rideHistory", user?.id] });
    } catch (err: any) {
      toast({ title: "Failed to cancel", description: err.message, variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };

  // Map status to step number
  const statusToStep: Record<string, number> = {
    pending: 1,
    accepted: 2,
    picked_up: 3,
    delivered: 4,
  };

  const currentStep = ride ? statusToStep[ride.status] || 1 : 1;
  const isWaitingForDriver = ride?.status === "pending";
  const isCancelled = ride?.status === "cancelled";
  const canCancel = ride && ["pending", "accepted"].includes(ride.status);

  // Filter ride history
  const filteredHistory = rideHistory.filter((r) => {
    const matchesSearch = searchQuery === "" || 
      r.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.drop_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    accepted: "bg-accent/10 text-accent",
    picked_up: "bg-primary/10 text-primary",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
    requested: "bg-accent/10 text-accent",
  };

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

          {ride && !isCancelled && (
            <>
              {/* Header */}
              <div className="mb-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ride Status</h1>
                  {currentStep === 4 && (
                    <span className="px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Delivered
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Booked on {new Date(ride.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Waiting for Driver - Uber-like UI */}
              {isWaitingForDriver && (
                <div className="p-8 rounded-xl bg-card border border-border shadow-card mb-6 animate-fade-in">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Search className="w-10 h-10 text-primary" />
                      </div>
                      <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" />
                      <div className="absolute -inset-3 w-30 h-30 rounded-full border border-primary/15 animate-pulse" />
                    </div>

                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Looking for nearby drivers
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4 max-w-sm">
                      We're searching for available drivers near your pickup location. This usually takes 1-3 minutes.
                    </p>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border w-full">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">Pickup</p>
                          <p className="font-medium text-foreground truncate max-w-[200px]">{ride.pickup}</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180 flex-shrink-0 mx-2" />
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Drop</p>
                          <p className="font-medium text-foreground truncate max-w-[200px]">{ride.drop_location}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="text-muted-foreground">{ride.vehicle_type}</span>
                        <span className="font-semibold text-primary">₹{ride.fare}</span>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <Button
                      variant="outline"
                      className="mt-6 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={handleCancelRide}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      {isCancelling ? "Cancelling..." : "Cancel Ride"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Stepper - show when driver is assigned */}
              {!isWaitingForDriver && (
                <div className="p-6 rounded-xl bg-card border border-border shadow-card mb-6 animate-slide-up">
                  <StatusStepper currentStep={currentStep} steps={steps} />
                </div>
              )}

              {/* Booking Details - show when not waiting */}
              {!isWaitingForDriver && (
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

                  {/* Cancel button for accepted rides */}
                  {canCancel && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={handleCancelRide}
                        disabled={isCancelling}
                      >
                        {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                        {isCancelling ? "Cancelling..." : "Cancel Ride"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Driver Info */}
              {ride.driver_name && !isWaitingForDriver && (
                <div className="p-6 rounded-xl bg-card border border-border shadow-card animate-scale-in">
                  <h2 className="font-semibold text-foreground mb-4">Driver Information</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{ride.driver_name.charAt(0)}</span>
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
                      <p className="text-sm text-muted-foreground mt-0.5">{ride.vehicle_number}</p>
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

          {/* Cancelled ride message */}
          {ride && isCancelled && (
            <div className="p-8 rounded-xl bg-card border border-border shadow-card mb-6 animate-fade-in text-center">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Ride Cancelled</h2>
              <p className="text-muted-foreground text-sm mb-2">
                {ride.pickup} → {ride.drop_location}
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {ride.vehicle_type} • ₹{ride.fare}
              </p>
              <Button variant="accent" asChild>
                <Link to="/book-ride">Book a New Ride</Link>
              </Button>
            </div>
          )}

          {/* Ride History with Search */}
          {rideHistory.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Ride History
                </h2>
                <span className="text-sm text-muted-foreground">{rideHistory.length} rides</span>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or vehicle..."
                    className="pl-9 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No rides match your search.
                  </div>
                ) : (
                  filteredHistory.map((pastRide) => (
                    <div
                      key={pastRide.id}
                      className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate("/ride-status", { state: { rideId: pastRide.id } })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="font-medium text-foreground text-sm truncate">
                            {pastRide.pickup}
                          </p>
                          <p className="font-medium text-foreground text-sm truncate mt-0.5">
                            → {pastRide.drop_location}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pastRide.vehicle_type} • {new Date(pastRide.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-foreground">₹{pastRide.fare}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[pastRide.status] || "bg-muted text-muted-foreground"}`}>
                            {pastRide.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RideStatus;
