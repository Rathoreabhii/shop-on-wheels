import { LucideIcon } from "lucide-react";

interface VehicleCardProps {
  name: string;
  icon: LucideIcon;
  baseFare: number;
  capacity: string;
  isSelected?: boolean;
  onSelect: () => void;
}

const VehicleCard = ({ name, icon: Icon, baseFare, capacity, isSelected, onSelect }: VehicleCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-5 rounded-xl border-2 transition-all duration-200 text-left group ${
        isSelected
          ? "border-primary bg-primary/5 shadow-lg"
          : "border-border bg-card hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
            isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          }`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{capacity}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">₹{baseFare}</p>
          <p className="text-xs text-muted-foreground">base fare</p>
        </div>
      </div>
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <p className="text-xs font-medium text-primary">✓ Selected</p>
        </div>
      )}
    </button>
  );
};

export default VehicleCard;
