import { MapMarker } from "@/lib/map-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { Clock, MapPin, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";

interface EventPanelProps {
  marker: MapMarker | null;
  open: boolean;
  onClose: () => void;
}

const EventPanel = ({ marker, open, onClose }: EventPanelProps) => {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {open && marker && (
        <>
          {/* Backdrop on mobile */}
          {isMobile && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
          )}

          {isMobile ? (
            /* ── Mobile: bottom sheet covering ~40% ── */
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border overflow-hidden"
              style={{
                height: "40vh",
                background: "hsl(var(--card))",
                boxShadow: "0 -8px 40px hsl(var(--primary) / 0.15)",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: "calc(40vh - 40px)" }}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display text-lg font-bold text-primary">
                    {marker.title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-muted transition-colors flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <PanelContent marker={marker} />
              </div>
            </motion.div>
          ) : (
            /* ── Desktop: left side panel ── */
            <motion.div
              className="absolute top-0 left-0 z-30 h-full w-[360px] border-r border-border overflow-hidden"
              style={{
                background: "hsl(var(--card))",
                boxShadow: "8px 0 40px hsl(var(--primary) / 0.1)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="font-display text-xl font-bold text-primary">
                  {marker.title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: "calc(100% - 64px)" }}>
                <PanelContent marker={marker} />
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

const PanelContent = ({ marker }: { marker: MapMarker }) => (
  <div className="space-y-4">
    {marker.category && (
      <Badge variant="outline" className="border-primary/40 text-primary font-display text-xs">
        <Tag className="w-3 h-3 mr-1" />
        {marker.category}
      </Badge>
    )}
    {marker.room && (
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <span>{marker.room}</span>
      </div>
    )}
    {marker.time && (
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Clock className="w-4 h-4 text-accent flex-shrink-0" />
        <span>{marker.time}</span>
      </div>
    )}
    {marker.description && (
      <div className="pt-2 border-t border-border">
        <p className="text-sm text-foreground/80 leading-relaxed">
          {marker.description}
        </p>
      </div>
    )}
  </div>
);

export default EventPanel;
