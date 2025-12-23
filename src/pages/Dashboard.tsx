import { Link, useNavigate } from "react-router-dom";
import { Truck, Package, CheckCircle, Clock, Plus, History, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's rides
  const { data: rides = [] } = useQuery({
    queryKey: ["rides", user?.id],
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

  // Fetch user's profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalRides = rides.length;
  const completedRides = rides.filter(r => r.status === "completed").length;
  const activeRides = rides.filter(r => r.status !== "completed");
  const activeRide = activeRides[0];
  const totalSpent = rides.reduce((sum, r) => sum + (r.fare || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome{profile?.shop_name ? `, ${profile.shop_name}` : ""} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your transport bookings and track deliveries
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
            <StatsCard
              title="Total Rides"
              value={totalRides}
              icon={Package}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <StatsCard
              title="Completed Rides"
              value={completedRides}
              icon={CheckCircle}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <StatsCard
              title="Active Rides"
              value={activeRides.length}
              icon={Clock}
              variant="accent"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <StatsCard
              title="Total Spent"
              value={`₹${totalSpent}`}
              icon={Truck}
            />
          </div>
        </div>

        {/* Active Ride Card */}
        {activeRide && (
          <div className="mb-8 p-6 rounded-xl bg-accent/5 border border-accent/20 animate-fade-in">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-accent">Active Ride</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {activeRide.pickup} → {activeRide.drop_location}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeRide.vehicle_type} • ₹{activeRide.fare} • {activeRide.status}
                </p>
              </div>
              <Button variant="accent" onClick={() => navigate("/ride-status", { state: { rideId: activeRide.id } })}>
                Track Ride
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/book-ride"
            className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-lg hover:border-primary/30 transition-all animate-slide-up"
            style={{ animationDelay: "0ms" }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Plus className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Book New Ride</h3>
            <p className="text-sm text-muted-foreground">
              Quick booking for auto, tempo, or mini-truck
            </p>
          </Link>

          <Link
            to="/ride-status"
            className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-lg hover:border-primary/30 transition-all animate-slide-up"
            style={{ animationDelay: "50ms" }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <History className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Ride History</h3>
            <p className="text-sm text-muted-foreground">
              View all your past bookings and invoices
            </p>
          </Link>

          <Link
            to="/suppliers"
            className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-lg hover:border-primary/30 transition-all animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Users className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Supplier Directory</h3>
            <p className="text-sm text-muted-foreground">
              Connect with trusted local suppliers
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
