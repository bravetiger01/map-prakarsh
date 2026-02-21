export interface EventMarker {
  id: string;
  x: number;
  y: number;
  eventName: string;
  locationName: string;
}

export interface FloorLayer {
  id: string;
  name: string;
  svgPath: string;
  markers: EventMarker[];
}

export interface EventMapState {
  floors: FloorLayer[];
  activeFloorId: string;
}

const STORAGE_KEY = 'techfest-event-map';

// Fixed floors based on SVG files in root
const FIXED_FLOORS: FloorLayer[] = [
  { id: 'ground', name: 'Ground Floor', svgPath: '/ground_floor.svg', markers: [] },
  { id: 'first', name: 'First Floor', svgPath: '/first_floor.svg', markers: [] },
  { id: 'second', name: 'Second Floor', svgPath: '/second_floor.svg', markers: [] },
  { id: 'third', name: 'Third Floor', svgPath: '/third_floor.svg', markers: [] },
];

const DEFAULT_STATE: EventMapState = {
  floors: FIXED_FLOORS,
  activeFloorId: 'ground',
};

export function loadEventMapState(): EventMapState {
  console.log('🟢 Loading state from localStorage...');
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    console.log('🟢 Raw data from localStorage:', raw);
    
    if (raw) {
      const parsed = JSON.parse(raw) as EventMapState;
      console.log('🟢 Parsed data:', parsed);
      
      // Ensure floor structure matches fixed floors
      const floors = FIXED_FLOORS.map(floor => {
        const saved = parsed.floors.find(f => f.id === floor.id);
        return saved ? { ...floor, markers: saved.markers } : floor;
      });
      
      const result = { floors, activeFloorId: parsed.activeFloorId || 'ground' };
      console.log('🟢 Final loaded state:', result);
      return result;
    }
  } catch (error) {
    console.error('🔴 Error loading from localStorage:', error);
  }
  
  console.log('🟢 Returning default state');
  return DEFAULT_STATE;
}

export function saveEventMapState(state: EventMapState) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
    console.log('✅ Saved to localStorage:', STORAGE_KEY, state);
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function getActiveFloor(state: EventMapState): FloorLayer {
  return state.floors.find(f => f.id === state.activeFloorId) || state.floors[0];
}
