import { Link } from "react-router-dom";
import { Truck, Package, CheckCircle, Clock, Plus, History, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { mockRideStats, mockCurrentRide } from "@/data/mockData";

const Dashboard = () => {
  const hasActiveRide = mockCurrentRide.status !== "completed";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome, Shopkeeper 👋
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
              value={mockRideStats.totalRides}
              icon={Package}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <StatsCard
              title="Completed Rides"
              value={mockRideStats.completedRides}
              icon={CheckCircle}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <StatsCard
              title="Active Ride"
              value={mockRideStats.activeRide}
              icon={Clock}
              variant="accent"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <StatsCard
              title="Money Saved"
              value={`₹${mockRideStats.savedAmount}`}
              icon={Truck}
              trend="+12% this month"
            />
          </div>
        </div>

        {/* Active Ride Card */}
        {hasActiveRide && (
          <div className="mb-8 p-6 rounded-xl bg-accent/5 border border-accent/20 animate-fade-in">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-accent">Active Ride</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {mockCurrentRide.pickup} → {mockCurrentRide.drop}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {mockCurrentRide.vehicle} • ₹{mockCurrentRide.fare} • ID: {mockCurrentRide.id}
                </p>
              </div>
              <Button variant="accent" asChild>
                <Link to="/ride-status">
                  Track Ride
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
