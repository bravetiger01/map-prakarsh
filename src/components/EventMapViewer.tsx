import { useState, useRef, useCallback, useEffect } from "react";
import { EventMarker, EventMapState, getActiveFloor } from "@/lib/event-map-store";
import { ZoomIn, ZoomOut, RotateCcw, MapPin } from "lucide-react";

interface EventMapViewerProps {
  mapState: EventMapState;
  onFloorChange: (floorId: string) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.5;

const EventMapViewer = ({ mapState, onFloorChange }: EventMapViewerProps) => {
  const [selectedMarker, setSelectedMarker] = useState<EventMarker | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [svgBounds, setSvgBounds] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
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
      // Allow panning with right-click or when zoomed in with left-click
      const isRightClick = e.button === 2;
      const canPan = isRightClick || zoom > 1;
      
      if (!canPan) return;
      if ((e.target as HTMLElement).closest('[data-marker]') || (e.target as HTMLElement).closest('button')) return;
      
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setPanOrigin({ ...pan });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
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
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Floor Switcher */}
      <div className="absolute top-4 left-4 z-20 glass rounded-lg p-2 flex gap-1">
        {mapState.floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => onFloorChange(floor.id)}
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

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          disabled={zoom === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur border border-border text-foreground hover:bg-primary/10 hover:text-primary transition disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden cursor-grab ${isPanning ? 'cursor-grabbing' : ''}`}
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
              <button
                key={marker.id}
                data-marker
                onClick={() => setSelectedMarker(marker)}
                className="absolute -translate-x-1/2 -translate-y-full group cursor-pointer z-10"
                style={{ left: `${markerLeft}px`, top: `${markerTop}px` }}
              >
              <div className="relative">
                <div className="pin-pulse">
                  <MapPin
                    className="w-8 h-8 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                    fill="hsl(var(--primary))"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 glass rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                <span className="text-xs font-display font-semibold text-primary">{marker.eventName}</span>
                <span className="block text-[10px] text-muted-foreground">{marker.locationName}</span>
              </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Details Panel */}
      {selectedMarker && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 glass rounded-xl p-4 w-80 border border-primary/20">
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
          <h3 className="font-display text-lg text-primary mb-2">{selectedMarker.eventName}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {selectedMarker.locationName}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventMapViewer;
