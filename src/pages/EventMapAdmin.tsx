import { useState } from "react";
import { loadEventMapState, EventMapState } from "@/lib/event-map-store";
import EventMapAdmin from "@/components/EventMapAdmin";
import { Map, Lock } from "lucide-react";

const EventMapAdminPage = () => {
  const [mapState, setMapState] = useState<EventMapState>(() => {
    const loaded = loadEventMapState();
    console.log('🔧 EventMapAdmin loaded state:', loaded);
    return loaded;
  });

  return (
    <div className="flex flex-col h-screen bg-background grid-bg overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 glass border-b border-primary/10 z-30">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6 text-primary" />
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-lg font-bold tracking-wider text-primary neon-text">
              Prakarsh'26
            </h1>
            <span className="text-xs font-display text-muted-foreground tracking-widest uppercase">Event Map Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/event-map"
            target="_blank"
            className="px-3 py-1.5 text-xs font-display text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition"
          >
            Preview Public Map
          </a>
          <div className="flex items-center gap-2 text-xs font-display text-accent">
            <Lock className="w-4 h-4" />
            ADMIN MODE
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass rounded-lg px-4 py-2">
          <p className="text-xs text-primary font-display">
            Left-click to place markers • Right-click & drag to pan • Scroll to zoom
          </p>
        </div>
        <EventMapAdmin mapState={mapState} setMapState={setMapState} />
      </main>
    </div>
  );
};

export default EventMapAdminPage;
