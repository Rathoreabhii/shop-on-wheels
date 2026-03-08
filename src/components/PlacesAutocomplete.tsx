import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat: number;
  lon: number;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, coords?: { lat: number; lon: number }) => void;
  placeholder?: string;
  className?: string;
  icon?: "pickup" | "drop";
  onUseCurrentLocation?: () => void;
  showCurrentLocation?: boolean;
}

const PlacesAutocomplete = ({
  value,
  onChange,
  placeholder = "Enter location",
  className = "",
  icon = "pickup",
  onUseCurrentLocation,
  showCurrentLocation = false,
}: PlacesAutocompleteProps) => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('places-autocomplete', {
        body: { input }
      });

      if (error) throw error;
      setPredictions(data.predictions || []);
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, fetchPredictions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (prediction: PlacePrediction) => {
    onChange(prediction.description, { lat: prediction.lat, lon: prediction.lon });
    setShowDropdown(false);
    setPredictions([]);
  };

  return (
    <div className="relative">
      <div
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
          icon === "pickup" ? "bg-success" : "bg-accent"
        }`}
      />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={`pl-10 h-12 ${showCurrentLocation ? 'pr-12' : ''} ${className}`}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />
      {showCurrentLocation && onUseCurrentLocation && (
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-secondary transition-colors text-primary"
          title="Use current location"
        >
          <Navigation className="w-4 h-4" />
        </button>
      )}
      {isLoading && !showCurrentLocation && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.placeId}
              type="button"
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-secondary transition-colors text-left"
              onClick={() => handleSelect(prediction)}
            >
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{prediction.mainText}</p>
                <p className="text-sm text-muted-foreground truncate">{prediction.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
