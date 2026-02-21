import { MapState, getActiveLayer, saveMapState } from "@/lib/map-store";
import { Layers } from "lucide-react";
import { useState } from "react";

interface LayerSwitcherProps {
  mapState: MapState;
  setMapState: React.Dispatch<React.SetStateAction<MapState>>;
}

const LayerSwitcher = ({ mapState, setMapState }: LayerSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const activeLayer = getActiveLayer(mapState);

  if (mapState.layers.length <= 1) return null;

  const switchLayer = (id: string) => {
    const updated: MapState = { ...mapState, activeLayerId: id };
    setMapState(updated);
    saveMapState(updated);
    setOpen(false);
  };

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <button
        onClick={() => setOpen(!open)}
        className="glass rounded-lg px-4 py-2.5 flex items-center gap-2 text-primary font-display text-xs hover:bg-primary/10 transition neon-glow"
      >
        <Layers className="w-4 h-4" />
        {activeLayer.name}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 glass rounded-lg overflow-hidden min-w-[180px]">
          {mapState.layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => switchLayer(layer.id)}
              className={`w-full text-left px-4 py-2.5 text-xs font-display transition ${
                layer.id === mapState.activeLayerId
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {layer.name}
              <span className="ml-2 text-[10px] text-muted-foreground">({layer.markers.length} pins)</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerSwitcher;
