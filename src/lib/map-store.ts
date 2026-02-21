export interface MapMarker {
  id: string;
  x: number;
  y: number;
  title: string;
  room: string;
  description: string;
  time: string;
  category: string;
}

export interface MapLayer {
  id: string;
  name: string;
  svgUrl: string;
  markers: MapMarker[];
}

export interface MapState {
  layers: MapLayer[];
  activeLayerId: string;
}

const STORAGE_KEY = 'techfest-map-data';

const DEFAULT_LAYER: MapLayer = {
  id: 'default',
  name: 'Main Map',
  svgUrl: '/map.svg',
  markers: [],
};

const DEFAULT_STATE: MapState = {
  layers: [DEFAULT_LAYER],
  activeLayerId: 'default',
};

// Migration from old format
interface OldMapState {
  svgUrl: string;
  markers: MapMarker[];
}

function migrateOldState(old: OldMapState): MapState {
  return {
    layers: [{
      id: 'default',
      name: 'Main Map',
      svgUrl: old.svgUrl,
      markers: old.markers,
    }],
    activeLayerId: 'default',
  };
}

export function loadMapState(): MapState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old format
      if ('svgUrl' in parsed && !('layers' in parsed)) {
        const migrated = migrateOldState(parsed as OldMapState);
        saveMapState(migrated);
        return migrated;
      }
      return parsed as MapState;
    }
  } catch {}
  return DEFAULT_STATE;
}

export function saveMapState(state: MapState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function getActiveLayer(state: MapState): MapLayer {
  return state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
}
