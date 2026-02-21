import { useState } from "react";
import { loadMapState, MapState } from "@/lib/map-store";
import MapViewer from "@/components/MapViewer";
import AdminPanel from "@/components/AdminPanel";
import LayerSwitcher from "@/components/LayerSwitcher";
import { Settings, Map } from "lucide-react";

const Index = () => {
  const [mapState, setMapState] = useState<MapState>(loadMapState);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background grid-bg overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 glass border-b border-primary/10 z-30">
        <div className="flex items-center gap-3">
          <Map className="w-6 h-6 text-primary" />
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-lg font-bold tracking-wider text-primary neon-text">
              Prakarsh'26
            </h1>
            <span className="text-xs font-display text-muted-foreground tracking-widest uppercase">Campus Map</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin ? (
            <button
              onClick={() => setIsAdmin(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-display text-muted-foreground hover:text-primary border border-border rounded-lg hover:border-primary/30 transition"
            >
              <Settings className="w-4 h-4" />
              Admin Mode
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-display text-accent">ADMIN MODE</span>
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-display text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition"
              >
                <Settings className="w-4 h-4" />
                Panel
              </button>
              <button
                onClick={() => { setIsAdmin(false); setShowAdmin(false); }}
                className="px-4 py-2 text-xs font-display text-muted-foreground border border-border rounded-lg hover:text-foreground transition"
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {isAdmin && !showAdmin && (
          <div className="absolute top-4 left-4 z-20 glass rounded-lg px-4 py-2">
            <p className="text-xs text-primary font-display">Click anywhere on the map to add a marker</p>
          </div>
        )}
        <MapViewer mapState={mapState} setMapState={setMapState} isAdmin={isAdmin} />
        <LayerSwitcher mapState={mapState} setMapState={setMapState} />
        {showAdmin && <AdminPanel mapState={mapState} setMapState={setMapState} onClose={() => setShowAdmin(false)} />}
      </main>
    </div>
  );
};

export default Index;
