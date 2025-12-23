import { Link } from "react-router-dom";
import { Truck, Bike, Package, ArrowRight, Shield, Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const Landing = () => {
  const features = [
    {
      icon: Clock,
      title: "Quick Booking",
      description: "Book your vehicle in under 2 minutes with our simple process",
    },
    {
      icon: Shield,
      title: "Safe & Reliable",
      description: "Verified drivers and insured goods for peace of mind",
    },
    {
      icon: IndianRupee,
      title: "Best Rates",
      description: "Transparent pricing with no hidden charges",
    },
  ];

  const vehicles = [
    { icon: Bike, name: "Auto", fare: "₹80", capacity: "200 kg" },
    { icon: Truck, name: "Tempo", fare: "₹150", capacity: "500 kg" },
    { icon: Package, name: "Mini Truck", fare: "₹300", capacity: "1000 kg" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Truck className="w-4 h-4" />
              <span>Your Local Transport Partner</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Book Local Transport for{" "}
              <span className="text-primary">Your Shop</span> in Minutes
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Auto, Tempo & Mini-Truck at your fingertips. Fast, reliable, and
              affordable goods transport for shopkeepers.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="xl" asChild>
                <Link to="/book-ride">
                  Book a Vehicle
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/suppliers">View Suppliers</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
            Choose Your Vehicle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.name}
                className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <vehicle.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{vehicle.name}</h3>
                <p className="mt-1 text-muted-foreground">Up to {vehicle.capacity}</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-2xl font-bold text-foreground">{vehicle.fare}</span>
                  <span className="text-muted-foreground text-sm"> base fare</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
            Why Choose LODR?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Built for shopkeepers who need reliable local transport without the hassle
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join thousands of shopkeepers who trust LODR for their daily transport needs.
          </p>
          <Button
            variant="secondary"
            size="xl"
            asChild
            className="bg-card text-foreground hover:bg-card/90"
          >
            <Link to="/login">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">LODR</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 LODR. All rights reserved. Local Goods Transport Made Easy.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
