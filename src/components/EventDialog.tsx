import { MapMarker } from "@/lib/map-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Tag } from "lucide-react";

interface EventDialogProps {
  marker: MapMarker | null;
  open: boolean;
  onClose: () => void;
}

const EventDialog = ({ marker, open, onClose }: EventDialogProps) => {
  if (!marker) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border-primary/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary neon-text">
            {marker.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {marker.category && (
            <Badge variant="outline" className="border-neon-purple text-neon-purple font-display text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {marker.category}
            </Badge>
          )}
          {marker.room && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{marker.room}</span>
            </div>
          )}
          {marker.time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span>{marker.time}</span>
            </div>
          )}
          {marker.description && (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {marker.description}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
