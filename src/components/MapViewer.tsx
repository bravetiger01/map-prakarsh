import { useState, useRef, useCallback, useEffect } from "react";
import { MapMarker, MapState, generateId, saveMapState, getActiveLayer } from "@/lib/map-store";
import MarkerPin from "./MarkerPin";
import EventPanel from "./EventPanel";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MapViewerProps {
  mapState: MapState;
  setMapState: React.Dispatch<React.SetStateAction<MapState>>;
  isAdmin: boolean;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

const MapViewer = ({ mapState, setMapState, isAdmin }: MapViewerProps) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingMarker, setAddingMarker] = useState(false);
  const [newMarkerPos, setNewMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const [form, setForm] = useState({ title: "", room: "", description: "", time: "", category: "" });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLayer = getActiveLayer(mapState);

  // Clamp pan so map doesn't go out of bounds
  const clampPan = useCallback((px: number, py: number, z: number) => {
    const maxPan = ((z - 1) / (2 * z)) * 100;
    return {
      x: Math.max(-maxPan, Math.min(maxPan, px)),
      y: Math.max(-maxPan, Math.min(maxPan, py)),
    };
  }, []);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    setZoom(newZoom);
    setPan(clampPan(pan.x, pan.y, newZoom));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    setZoom(newZoom);
    setPan(clampPan(pan.x, pan.y, newZoom));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
      setZoom(newZoom);
      setPan(clampPan(pan.x, pan.y, newZoom));
    },
    [zoom, pan, clampPan]
  );

  // Pan via mouse drag (only when zoomed in)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return;
      // Don't pan if clicking a marker or button
      if ((e.target as HTMLElement).closest('[data-marker]') || (e.target as HTMLElement).closest('button')) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setPanOrigin({ ...pan });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [zoom, pan]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - panStart.x) / rect.width) * 100;
      const dy = ((e.clientY - panStart.y) / rect.height) * 100;
      setPan(clampPan(panOrigin.x + dx, panOrigin.y + dy, zoom));
    },
    [isPanning, panStart, panOrigin, zoom, clampPan]
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch pinch zoom
  const lastTouchDist = useRef<number | null>(null);
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastTouchDist.current !== null) {
          const delta = (dist - lastTouchDist.current) * 0.01;
          const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
          setZoom(newZoom);
          setPan(clampPan(pan.x, pan.y, newZoom));
        }
        lastTouchDist.current = dist;
      }
    },
    [zoom, pan, clampPan]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
  }, []);

  // Map click for adding markers (only if not panning)
  const wasPanning = useRef(false);
  useEffect(() => {
    if (isPanning) wasPanning.current = true;
  }, [isPanning]);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (wasPanning.current) {
        wasPanning.current = false;
        return;
      }
      if (!isAdmin) return;
      const rect = e.currentTarget.getBoundingClientRect();
      // Account for zoom and pan to get correct map coordinates
      const viewX = ((e.clientX - rect.left) / rect.width) * 100;
      const viewY = ((e.clientY - rect.top) / rect.height) * 100;
      const mapX = (viewX - 50) / zoom + 50 - pan.x;
      const mapY = (viewY - 50) / zoom + 50 - pan.y;
      setNewMarkerPos({ x: mapX, y: mapY });
      setAddingMarker(true);
      setForm({ title: "", room: "", description: "", time: "", category: "" });
    },
    [isAdmin, zoom, pan]
  );

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setDialogOpen(true);
  };

  const handleAddMarker = () => {
    if (!newMarkerPos || !form.title) return;
    const newMarker: MapMarker = {
      id: generateId(),
      x: newMarkerPos.x,
      y: newMarkerPos.y,
      ...form,
    };
    const updated: MapState = {
      ...mapState,
      layers: mapState.layers.map(l =>
        l.id === mapState.activeLayerId
          ? { ...l, markers: [...l.markers, newMarker] }
          : l
      ),
    };
    setMapState(updated);
    saveMapState(updated);
    setAddingMarker(false);
    setNewMarkerPos(null);
  };

  return (
    <div className="relative w-full h-full">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          disabled={zoom === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        {zoom > 1 && (
          <div className="text-[10px] text-center text-muted-foreground font-display mt-1">
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${zoom > 1 ? 'cursor-grab' : isAdmin ? 'cursor-crosshair' : 'cursor-default'} ${isPanning ? 'cursor-grabbing' : ''}`}
        onClick={handleMapClick}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={activeLayer?.svgUrl || '/map.svg'}
            alt="Campus Map"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />
          {activeLayer?.markers?.map((marker) => (
            <MarkerPin
              key={marker.id}
              marker={marker}
              onClick={handleMarkerClick}
              isAdmin={isAdmin}
            />
          ))}
          {isAdmin && newMarkerPos && addingMarker && (
            <div
              className="absolute w-3 h-3 rounded-full bg-accent border-2 border-accent -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ left: `${newMarkerPos.x}%`, top: `${newMarkerPos.y}%` }}
            />
          )}
        </div>
      </div>

      {/* Add marker form overlay */}
      {isAdmin && addingMarker && newMarkerPos && (
        <div className="absolute top-4 left-4 z-20 glass rounded-xl p-5 w-80 space-y-3">
          <h3 className="font-display text-sm text-primary">Add Event Marker</h3>
          <input
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Event Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Room / Location"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
          />
          <input
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Time (e.g. 10:00 AM - 12:00 PM)"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
          <input
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Category (e.g. Workshop, Talk)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <textarea
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddMarker}
              disabled={!form.title}
              className="flex-1 bg-primary text-primary-foreground font-display text-xs py-2 rounded-lg hover:opacity-90 transition disabled:opacity-40"
            >
              Add Marker
            </button>
            <button
              onClick={() => { setAddingMarker(false); setNewMarkerPos(null); }}
              className="flex-1 bg-muted text-muted-foreground font-display text-xs py-2 rounded-lg hover:bg-border transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <EventPanel
        marker={selectedMarker}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
};

export default MapViewer;
