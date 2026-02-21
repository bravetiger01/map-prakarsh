import { useState, useRef, useCallback, useEffect } from "react";
import { EventMarker, EventMapState, generateId, saveEventMapState, getActiveFloor } from "@/lib/event-map-store";
import { exportMapData, importMapData, clearMapData } from "@/utils/map-backup";
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Trash2, Upload, Download, FileUp, Trash } from "lucide-react";

interface EventMapAdminProps {
  mapState: EventMapState;
  setMapState: React.Dispatch<React.SetStateAction<EventMapState>>;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

const EventMapAdmin = ({ mapState, setMapState }: EventMapAdminProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [addingMarker, setAddingMarker] = useState(false);
  const [newMarkerPos, setNewMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const [form, setForm] = useState({ eventName: "", locationName: "" });
  const [svgBounds, setSvgBounds] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<HTMLImageElement>(null);
  const activeFloor = getActiveFloor(mapState);

  // Calculate actual SVG bounds within container (accounting for object-contain)
  useEffect(() => {
    const updateSvgBounds = () => {
      if (!containerRef.current || !svgRef.current) return;
      
      const container = containerRef.current.getBoundingClientRect();
      const img = svgRef.current;
      
      // Get natural dimensions of SVG
      const naturalWidth = img.naturalWidth || 2912;
      const naturalHeight = img.naturalHeight || 3048;
      const naturalRatio = naturalWidth / naturalHeight;
      
      // Get container dimensions
      const containerRatio = container.width / container.height;
      
      let svgWidth, svgHeight, svgLeft, svgTop;
      
      // Calculate actual rendered size (object-contain behavior)
      if (containerRatio > naturalRatio) {
        // Container is wider - SVG is constrained by height
        svgHeight = container.height;
        svgWidth = svgHeight * naturalRatio;
        svgLeft = (container.width - svgWidth) / 2;
        svgTop = 0;
      } else {
        // Container is taller - SVG is constrained by width
        svgWidth = container.width;
        svgHeight = svgWidth / naturalRatio;
        svgLeft = 0;
        svgTop = (container.height - svgHeight) / 2;
      }
      
      setSvgBounds({ width: svgWidth, height: svgHeight, left: svgLeft, top: svgTop });
    };
    
    updateSvgBounds();
    window.addEventListener('resize', updateSvgBounds);
    
    // Update when image loads
    const img = svgRef.current;
    if (img) {
      img.addEventListener('load', updateSvgBounds);
    }
    
    return () => {
      window.removeEventListener('resize', updateSvgBounds);
      if (img) {
        img.removeEventListener('load', updateSvgBounds);
      }
    };
  }, [activeFloor.svgPath]);

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Right-click always pans, left-click pans only when zoomed
      const isRightClick = e.button === 2;
      const canPan = isRightClick || zoom > 1;
      
      if (!canPan) return;
      if ((e.target as HTMLElement).closest('[data-marker]') || (e.target as HTMLElement).closest('button')) return;
      
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setPanOrigin({ ...pan });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      wasPanning.current = true;
    },
    [zoom, pan]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent context menu on right-click
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0' || e.key === 'r') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, pan]);

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
    // Reset panning flag after a short delay to allow click detection
    setTimeout(() => {
      wasPanning.current = false;
    }, 100);
  }, []);

  const wasPanning = useRef(false);
  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't place marker if we were panning or if it was a right-click
      if (wasPanning.current || e.button === 2 || svgBounds.width === 0) {
        return;
      }
      
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Check if click is within SVG bounds
      if (clickX < svgBounds.left || clickX > svgBounds.left + svgBounds.width ||
          clickY < svgBounds.top || clickY > svgBounds.top + svgBounds.height) {
        return; // Click outside SVG
      }
      
      // Calculate position relative to SVG (not container)
      const svgX = clickX - svgBounds.left;
      const svgY = clickY - svgBounds.top;
      
      // Convert to percentage of SVG dimensions
      const mapX = (svgX / svgBounds.width) * 100;
      const mapY = (svgY / svgBounds.height) * 100;
      
      setNewMarkerPos({ x: mapX, y: mapY });
      setAddingMarker(true);
      setForm({ eventName: "", locationName: "" });
    },
    [svgBounds]
  );

  const handleAddMarker = () => {
    if (!newMarkerPos || !form.eventName) return;
    
    console.log('🔵 Adding marker at:', newMarkerPos);
    
    const newMarker: EventMarker = {
      id: generateId(),
      x: newMarkerPos.x,
      y: newMarkerPos.y,
      eventName: form.eventName,
      locationName: form.locationName,
    };
    
    console.log('🔵 New marker created:', newMarker);
    
    const updated: EventMapState = {
      ...mapState,
      floors: mapState.floors.map(f =>
        f.id === mapState.activeFloorId
          ? { ...f, markers: [...f.markers, newMarker] }
          : f
      ),
    };
    
    console.log('🔵 Updated state:', updated);
    console.log('🔵 Active floor markers:', updated.floors.find(f => f.id === mapState.activeFloorId)?.markers);
    
    setMapState(updated);
    saveEventMapState(updated);
    
    // Verify it was saved
    setTimeout(() => {
      const saved = localStorage.getItem('techfest-event-map');
      console.log('🔵 Verified localStorage:', saved ? JSON.parse(saved) : 'NOT FOUND');
    }, 100);
    
    setAddingMarker(false);
    setNewMarkerPos(null);
  };

  const handleDeleteMarker = (id: string) => {
    const updated: EventMapState = {
      ...mapState,
      floors: mapState.floors.map(f =>
        f.id === mapState.activeFloorId
          ? { ...f, markers: f.markers.filter(m => m.id !== id) }
          : f
      ),
    };
    setMapState(updated);
    saveEventMapState(updated);
  };

  const handleFloorChange = (floorId: string) => {
    const updated: EventMapState = { ...mapState, activeFloorId: floorId };
    setMapState(updated);
    saveEventMapState(updated);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      // Skip header if present
      const dataLines = lines[0].toLowerCase().includes('event') ? lines.slice(1) : lines;
      
      console.log(`Parsed ${dataLines.length} events from CSV`);
      alert(`Loaded ${dataLines.length} events. Now click on the map to place markers for each event.`);
    };
    reader.readAsText(file);
  };

  const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importMapData(file);
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Floor Switcher */}
      <div className="absolute top-4 left-4 z-20 glass rounded-lg p-2 flex gap-1">
        {mapState.floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => handleFloorChange(floor.id)}
            className={`px-3 py-1.5 rounded text-xs font-display transition ${
              floor.id === mapState.activeFloorId
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {floor.name}
          </button>
        ))}
      </div>

      {/* CSV Upload */}
      <div className="absolute top-16 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => csvInputRef.current?.click()}
          className="glass rounded-lg px-3 py-2 text-xs font-display text-primary hover:bg-primary/10 transition flex items-center gap-2"
        >
          <Upload className="w-3.5 h-3.5" />
          Import CSV
        </button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />
        
        <button
          onClick={exportMapData}
          className="glass rounded-lg px-3 py-2 text-xs font-display text-green-500 hover:bg-green-500/10 transition flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          Export Backup
        </button>
        
        <button
          onClick={() => backupInputRef.current?.click()}
          className="glass rounded-lg px-3 py-2 text-xs font-display text-blue-500 hover:bg-blue-500/10 transition flex items-center gap-2"
        >
          <FileUp className="w-3.5 h-3.5" />
          Import Backup
        </button>
        <input
          ref={backupInputRef}
          type="file"
          accept=".json"
          onChange={handleBackupImport}
          className="hidden"
        />
        
        <button
          onClick={clearMapData}
          className="glass rounded-lg px-3 py-2 text-xs font-display text-red-500 hover:bg-red-500/10 transition flex items-center gap-2"
        >
          <Trash className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM} className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleReset} disabled={zoom === 1} className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Markers List */}
      <div className="absolute top-4 right-16 z-20 glass rounded-lg p-3 w-64 max-h-96 overflow-y-auto">
        <h3 className="text-xs font-display text-primary mb-2">
          {activeFloor.name} Markers ({activeFloor.markers.length})
        </h3>
        <div className="space-y-1">
          {activeFloor.markers.map((marker) => (
            <div key={marker.id} className="flex items-start justify-between bg-muted rounded p-2 text-xs">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground truncate">{marker.eventName}</div>
                <div className="text-muted-foreground text-[10px] truncate">{marker.locationName}</div>
              </div>
              <button
                onClick={() => handleDeleteMarker(marker.id)}
                className="ml-2 text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden cursor-grab ${isPanning ? 'cursor-grabbing' : ''}`}
        onClick={handleMapClick}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
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
            ref={svgRef}
            src={activeFloor.svgPath}
            alt={activeFloor.name}
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />
          {svgBounds.width > 0 && activeFloor.markers.map((marker) => {
            // Calculate marker position within actual SVG bounds
            const markerLeft = svgBounds.left + (marker.x / 100) * svgBounds.width;
            const markerTop = svgBounds.top + (marker.y / 100) * svgBounds.height;
            
            return (
              <div
                key={marker.id}
                data-marker
                className="absolute -translate-x-1/2 -translate-y-full z-10"
                style={{ left: `${markerLeft}px`, top: `${markerTop}px` }}
              >
                <MapPin
                  className="w-6 h-6 text-primary"
                  fill="hsl(var(--primary))"
                  strokeWidth={1.5}
                />
              </div>
            );
          })}
          {addingMarker && newMarkerPos && svgBounds.width > 0 && (
            <div
              className="absolute w-3 h-3 rounded-full bg-accent border-2 border-accent -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ 
                left: `${svgBounds.left + (newMarkerPos.x / 100) * svgBounds.width}px`, 
                top: `${svgBounds.top + (newMarkerPos.y / 100) * svgBounds.height}px` 
              }}
            />
          )}
        </div>
      </div>

      {/* Add Marker Form */}
      {addingMarker && newMarkerPos && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 glass rounded-xl p-4 w-80 space-y-3">
          <h3 className="font-display text-sm text-primary">Add Event Marker</h3>
          <input
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Event Name *"
            value={form.eventName}
            onChange={(e) => setForm({ ...form, eventName: e.target.value })}
          />
          <input
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Location Name"
            value={form.locationName}
            onChange={(e) => setForm({ ...form, locationName: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddMarker}
              disabled={!form.eventName}
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
    </div>
  );
};

export default EventMapAdmin;
