import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SupplierCardProps {
  name: string;
  category: string;
  phone: string;
  rating?: number;
}

const SupplierCard = ({ name, category, phone, rating }: SupplierCardProps) => {
  return (
    <div className="p-5 rounded-xl border border-border bg-card shadow-card hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{name}</h3>
            {rating && (
              <span className="px-2 py-0.5 text-xs font-medium bg-success/10 text-success rounded-full">
                ⭐ {rating}
              </span>
            )}
          </div>
          <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
            {category}
          </span>
          <p className="mt-3 text-sm text-muted-foreground">{phone}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="accent" size="sm" className="w-full" asChild>
          <a href={`tel:${phone}`}>
            <Phone className="w-4 h-4" />
            Call Supplier
          </a>
        </Button>
      </div>
    </div>
  );
};

export default SupplierCard;
