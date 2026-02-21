import { MapMarker } from "@/lib/map-store";
import { MapPin } from "lucide-react";

interface MarkerPinProps {
  marker: MapMarker;
  onClick: (marker: MapMarker) => void;
  isAdmin?: boolean;
}

const MarkerPin = ({ marker, onClick, isAdmin }: MarkerPinProps) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(marker);
      }}
      className="absolute -translate-x-1/2 -translate-y-full group cursor-pointer z-10"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      title={marker.title}
    >
      <div className="relative">
        <div className="pin-pulse">
          <MapPin
            className="w-8 h-8 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
            fill="hsl(var(--primary))"
            strokeWidth={1.5}
          />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full bg-primary/40 blur-sm" />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 glass rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        <span className="text-xs font-display font-semibold text-primary">{marker.title}</span>
        {marker.room && (
          <span className="block text-[10px] text-muted-foreground">{marker.room}</span>
        )}
      </div>
    </button>
  );
};

export default MarkerPin;
