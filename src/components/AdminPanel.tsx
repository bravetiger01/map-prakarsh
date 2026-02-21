import { useState, useRef } from "react";
import { MapMarker, MapState, MapLayer, generateId, saveMapState, getActiveLayer } from "@/lib/map-store";
import { Upload, Trash2, Edit3, X, Check, Layers, Plus } from "lucide-react";

interface AdminPanelProps {
  mapState: MapState;
  setMapState: React.Dispatch<React.SetStateAction<MapState>>;
  onClose: () => void;
}

const AdminPanel = ({ mapState, setMapState, onClose }: AdminPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newLayerFileRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MapMarker>>({});
  const [newLayerName, setNewLayerName] = useState("");
  const [showNewLayer, setShowNewLayer] = useState(false);

  const activeLayer = getActiveLayer(mapState);

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const updated: MapState = {
      ...mapState,
      layers: mapState.layers.map(l =>
        l.id === mapState.activeLayerId ? { ...l, svgUrl: url } : l
      ),
    };
    setMapState(updated);
    saveMapState(updated);
  };

  const handleNewLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const name = newLayerName.trim() || file.name.replace('.svg', '');
    const newLayer: MapLayer = {
      id: generateId(),
      name,
      svgUrl: url,
      markers: [],
    };
    const updated: MapState = {
      layers: [...mapState.layers, newLayer],
      activeLayerId: newLayer.id,
    };
    setMapState(updated);
    saveMapState(updated);
    setShowNewLayer(false);
    setNewLayerName("");
  };

  const deleteLayer = (id: string) => {
    if (mapState.layers.length <= 1) return;
    const remaining = mapState.layers.filter(l => l.id !== id);
    const updated: MapState = {
      layers: remaining,
      activeLayerId: mapState.activeLayerId === id ? remaining[0].id : mapState.activeLayerId,
    };
    setMapState(updated);
    saveMapState(updated);
  };

  const switchLayer = (id: string) => {
    const updated: MapState = { ...mapState, activeLayerId: id };
    setMapState(updated);
    saveMapState(updated);
  };

  const deleteMarker = (id: string) => {
    const updated: MapState = {
      ...mapState,
      layers: mapState.layers.map(l =>
        l.id === mapState.activeLayerId
          ? { ...l, markers: l.markers.filter(m => m.id !== id) }
          : l
      ),
    };
    setMapState(updated);
    saveMapState(updated);
  };

  const startEdit = (marker: MapMarker) => {
    setEditingId(marker.id);
    setEditForm({ title: marker.title, room: marker.room, description: marker.description, time: marker.time, category: marker.category });
  };

  const saveEdit = (id: string) => {
    const updated: MapState = {
      ...mapState,
      layers: mapState.layers.map(l =>
        l.id === mapState.activeLayerId
          ? { ...l, markers: l.markers.map(m => m.id === id ? { ...m, ...editForm } : m) }
          : l
      ),
    };
    setMapState(updated);
    saveMapState(updated);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 glass z-50 flex flex-col border-l border-primary/20 shadow-2xl">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="font-display text-lg text-primary neon-text">Admin Panel</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Layers Section */}
      <div className="p-5 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Layers ({mapState.layers.length})
          </h3>
          <button
            onClick={() => setShowNewLayer(!showNewLayer)}
            className="text-xs text-primary hover:text-primary/80 transition flex items-center gap-1 font-display"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {showNewLayer && (
          <div className="space-y-2 bg-muted rounded-lg p-3 border border-border">
            <input
              className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Layer name"
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
            />
            <button
              onClick={() => newLayerFileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 bg-background border border-dashed border-primary/30 rounded-lg py-2 text-xs text-primary hover:bg-primary/10 transition font-display"
            >
              <Upload className="w-3.5 h-3.5" /> Upload SVG for Layer
            </button>
            <input ref={newLayerFileRef} type="file" accept=".svg" onChange={handleNewLayerUpload} className="hidden" />
          </div>
        )}

        <div className="space-y-1.5">
          {mapState.layers.map((layer) => (
            <div
              key={layer.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                layer.id === mapState.activeLayerId
                  ? 'bg-primary/15 border border-primary/30 text-primary'
                  : 'bg-muted border border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
              onClick={() => switchLayer(layer.id)}
            >
              <span className="font-display text-xs truncate">{layer.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{layer.markers.length} pins</span>
                {mapState.layers.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    className="p-0.5 text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Replace SVG for active layer */}
      <div className="p-5 border-b border-border space-y-3">
        <h3 className="font-display text-xs text-muted-foreground uppercase tracking-wider">
          Replace SVG — {activeLayer.name}
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 bg-muted border border-dashed border-primary/30 rounded-lg py-3 text-sm text-primary hover:bg-primary/10 transition font-display"
        >
          <Upload className="w-4 h-4" />
          Upload New SVG
        </button>
        <input ref={fileInputRef} type="file" accept=".svg" onChange={handleSvgUpload} className="hidden" />
      </div>

      {/* Markers for active layer */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 className="font-display text-xs text-muted-foreground uppercase tracking-wider">
          Markers — {activeLayer.name} ({activeLayer.markers.length})
        </h3>
        {activeLayer.markers.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No markers yet. Click on the map to add one.</p>
        )}
        {activeLayer.markers.map((marker) => (
          <div key={marker.id} className="bg-muted rounded-lg p-3 space-y-2 border border-border">
            {editingId === marker.id ? (
              <div className="space-y-2">
                <input
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Title"
                />
                <input
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editForm.room || ""}
                  onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                  placeholder="Room"
                />
                <input
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editForm.time || ""}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  placeholder="Time"
                />
                <input
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={editForm.category || ""}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="Category"
                />
                <textarea
                  className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(marker.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:underline">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{marker.title}</h4>
                    {marker.room && <p className="text-xs text-muted-foreground">{marker.room}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(marker)} className="p-1 text-muted-foreground hover:text-primary transition">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMarker(marker.id)} className="p-1 text-muted-foreground hover:text-destructive transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {marker.time && <p className="text-xs text-accent">{marker.time}</p>}
                {marker.category && <p className="text-xs text-neon-purple">{marker.category}</p>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
