import { useState } from "react";
import { loadEventMapState, EventMapState, saveEventMapState } from "@/lib/event-map-store";
import EventMapViewer from "@/components/EventMapViewer";
import { Map } from "lucide-react";

const EventMap = () => {
  const [mapState, setMapState] = useState<EventMapState>(() => {
    const loaded = loadEventMapState();
    console.log('📍 EventMap loaded state:', loaded);
    return loaded;
  });

  const handleFloorChange = (floorId: string) => {
    const updated: EventMapState = { ...mapState, activeFloorId: floorId };
    setMapState(updated);
    saveEventMapState(updated);
  };

  return (
    <div className="flex flex-col h-screen bg-background grid-bg overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 glass border-b border-primary/10 z-30">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6 text-primary" />
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-lg font-bold tracking-wider text-primary neon-text">
              Prakarsh'26
            </h1>
            <span className="text-xs font-display text-muted-foreground tracking-widest uppercase">Event Map</span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute bottom-4 left-4 z-20 glass rounded-lg px-3 py-2">
          <p className="text-[10px] text-muted-foreground font-display">
            Right-click & drag to pan • Scroll to zoom
          </p>
        </div>
        <EventMapViewer mapState={mapState} onFloorChange={handleFloorChange} />
      </main>
    </div>
  );
};

export default EventMap;
