import { AreaId, NPC, ItemObject, Position } from "./types";

export interface MapArea {
  id: AreaId;
  name: string;
  width: number;
  height: number;
  spawnPoint: Position;
  collisions: { x: number; y: number; w: number; h: number }[];
  npcs: NPC[];
  items: ItemObject[];
  decorations: {
    type: "tree" | "flower" | "house" | "well" | "bench" | "sign" | "gasPump" | "crate" | "barrel" | "shrub" | "cloud";
    x: number;
    y: number;
    color?: string;
  }[];
}

export const MAP_AREAS: Record<AreaId, MapArea> = {
  1: {
    id: 1,
    name: "The Village",
    width: 900,
    height: 650,
    spawnPoint: { x: 120, y: 320 },
    collisions: [
      // Screen boundaries
      { x: 0, y: 0, w: 900, h: 40 }, // North boundary wall
      { x: 0, y: 610, w: 900, h: 40 }, // South boundary wall
      { x: 0, y: 0, w: 40, h: 650 }, // West boundary wall
      // Custom objects
      { x: 300, y: 120, w: 160, h: 140 }, // Guide's cozy house
      { x: 150, y: 150, w: 40, h: 40 }, // Well
      { x: 550, y: 450, w: 80, h: 40 }, // Bench area
      // Tree clumps (top and bottom blocks)
      { x: 40, y: 40, w: 200, h: 80 },
      { x: 500, y: 40, w: 360, h: 80 },
      { x: 40, y: 480, w: 300, h: 130 },
      { x: 650, y: 480, w: 210, h: 130 },
    ],
    npcs: [
      {
        id: "guide",
        name: "Coach Moh",
        portrait: "/moh.png",
        x: 550, // Near the motorcycle in Area 1
        y: 280,
        width: 32,
        height: 48,
        spriteType: "guide",
        dialogue: [], // Loaded dynamically from GAME_CONFIG
        interactRange: 50,
        hasQuestTrigger: "find_memories",
      }
    ],
    items: [
      {
        id: "memory01",
        name: "Glowing Polaroid",
        icon: "🖼️",
        x: 750,
        y: 140,
        width: 24,
        height: 24,
        type: "memory",
        memoryId: "memory01",
        collected: false,
      }
    ],
    decorations: [
      // House
      { type: "house", x: 300, y: 120 },
      // Well
      { type: "well", x: 150, y: 150 },
      // Benches
      { type: "bench", x: 550, y: 450 },
      // Signs
      { type: "sign", x: 780, y: 330 }, // Sign pointing to Area 2 (Memory Path)
      // Flowers
      { type: "flower", x: 120, y: 180, color: "#f43f5e" },
      { type: "flower", x: 140, y: 190, color: "#ec4899" },
      { type: "flower", x: 130, y: 210, color: "#f43f5e" },
      { type: "flower", x: 160, y: 200, color: "#eab308" },
      { type: "flower", x: 180, y: 190, color: "#a855f7" },
      { type: "flower", x: 480, y: 280, color: "#eab308" },
      { type: "flower", x: 510, y: 290, color: "#3b82f6" },
      { type: "flower", x: 530, y: 270, color: "#f43f5e" },
      { type: "flower", x: 550, y: 280, color: "#ec4899" },
      // Trees
      { type: "tree", x: 60, y: 60 },
      { type: "tree", x: 120, y: 50 },
      { type: "tree", x: 180, y: 60 },
      { type: "tree", x: 540, y: 50 },
      { type: "tree", x: 600, y: 60 },
      { type: "tree", x: 660, y: 50 },
      { type: "tree", x: 720, y: 70 },
      { type: "tree", x: 780, y: 50 },
      { type: "tree", x: 840, y: 60 },
      
      { type: "tree", x: 60, y: 500 },
      { type: "tree", x: 120, y: 530 },
      { type: "tree", x: 180, y: 510 },
      { type: "tree", x: 240, y: 540 },
      { type: "tree", x: 700, y: 510 },
      { type: "tree", x: 760, y: 530 },
      { type: "tree", x: 820, y: 500 },
      
      // Decorative shrubs
      { type: "shrub", x: 430, y: 130 },
      { type: "shrub", x: 280, y: 180 },
    ],
  },
  2: {
    id: 2,
    name: "The Memory Path",
    width: 1100,
    height: 650,
    spawnPoint: { x: 60, y: 320 },
    collisions: [
      // Screen boundaries
      { x: 0, y: 0, w: 1100, h: 40 },
      { x: 0, y: 610, w: 1100, h: 40 },
      // Thick forest walls (blocking navigation out of pathways)
      { x: 100, y: 40, w: 300, h: 180 }, // Northern tree wall
      { x: 500, y: 40, w: 250, h: 160 },
      { x: 40, y: 440, w: 450, h: 170 }, // Southern tree wall
      { x: 600, y: 400, w: 460, h: 210 }, // Big southeastern block
      { x: 810, y: 40, w: 60, h: 140 }, // Thin vertical tree barrier, opening up the passage to the east
    ],
    npcs: [
      {
        id: "traveler",
        name: "Coach Farouk",
        portrait: "/Farouk.png",
        x: 480,
        y: 280,
        width: 32,
        height: 48,
        spriteType: "traveler",
        dialogue: [],
        interactRange: 50,
      }
    ],
    items: [
      {
        id: "memory02",
        name: "Glowing Polaroid",
        icon: "🖼️",
        x: 950,
        y: 120, // Inside the hidden northeastern clearing
        width: 24,
        height: 24,
        type: "memory",
        memoryId: "memory02",
        collected: false,
      }
    ],
    decorations: [
      // Signs
      { type: "sign", x: 980, y: 330 }, // Sign pointing to Area 3 (The Road)
      // Forest Trees
      { type: "tree", x: 120, y: 80 },
      { type: "tree", x: 180, y: 90 },
      { type: "tree", x: 240, y: 70 },
      { type: "tree", x: 300, y: 110 },
      { type: "tree", x: 360, y: 80 },
      
      { type: "tree", x: 520, y: 60 },
      { type: "tree", x: 580, y: 70 },
      { type: "tree", x: 640, y: 80 },
      
      { type: "tree", x: 800, y: 50 },
      { type: "tree", x: 1040, y: 70 },
      { type: "tree", x: 1060, y: 120 },
      
      // South Trees
      { type: "tree", x: 80, y: 460 },
      { type: "tree", x: 140, y: 480 },
      { type: "tree", x: 200, y: 450 },
      { type: "tree", x: 260, y: 490 },
      { type: "tree", x: 320, y: 470 },
      { type: "tree", x: 380, y: 500 },
      { type: "tree", x: 440, y: 460 },
      
      { type: "tree", x: 620, y: 440 },
      { type: "tree", x: 680, y: 470 },
      { type: "tree", x: 740, y: 430 },
      { type: "tree", x: 800, y: 480 },
      { type: "tree", x: 860, y: 450 },
      { type: "tree", x: 920, y: 490 },
      { type: "tree", x: 980, y: 460 },
      
      // Beautiful flowers in the hidden northeastern clearing
      { type: "flower", x: 920, y: 160, color: "#a855f7" },
      { type: "flower", x: 950, y: 170, color: "#ec4899" },
      { type: "flower", x: 970, y: 150, color: "#a855f7" },
      { type: "flower", x: 940, y: 190, color: "#3b82f6" },
      { type: "flower", x: 980, y: 180, color: "#10b981" },
    ],
  },
  3: {
    id: 3,
    name: "The Road",
    width: 1200,
    height: 650,
    spawnPoint: { x: 60, y: 320 },
    collisions: [
      // Boundary collisions
      { x: 0, y: 0, w: 1200, h: 40 },
      { x: 0, y: 610, w: 1200, h: 40 },
      // Road structures, fuel station and garage
      { x: 750, y: 80, w: 180, h: 140 }, // Garage Building (Requires key to enter)
      { x: 250, y: 40, w: 200, h: 120 }, // North forest block
      { x: 100, y: 500, w: 320, h: 110 }, // South forest block
      { x: 500, y: 500, w: 400, h: 110 }, // South block
      { x: 200, y: 150, w: 50, h: 50 }, // Crate pile (helmet location)
    ],
    npcs: [
      {
        id: "mechanic",
        name: "Mr afif",
        portrait: "/Afif.png",
        x: 680,
        y: 180,
        width: 32,
        height: 48,
        spriteType: "mechanic",
        dialogue: [],
        interactRange: 50,
      }
    ],
    items: [
      {
        id: "helmet",
        name: "Vintage Helmet",
        icon: "🏍️",
        x: 212,
        y: 120, // Sitting on crate
        width: 24,
        height: 24,
        type: "helmet",
        collected: false,
      },
      {
        id: "key",
        name: "Rusty Key",
        icon: "🔑",
        x: 520,
        y: 450, // Sitting on the southern clearing
        width: 24,
        height: 24,
        type: "key",
        collected: false,
      },
      {
        id: "memory03",
        name: "Glowing Polaroid",
        icon: "🖼️",
        x: 950,
        y: 470, // Sitting near a cozy bench at bottom right
        width: 24,
        height: 24,
        type: "memory",
        memoryId: "memory03",
        collected: false,
      }
    ],
    decorations: [
      // Benches
      { type: "bench", x: 910, y: 480 },
      // Garage structure
      { type: "house", x: 750, y: 80 }, // Represents the garage
      // Sign
      { type: "sign", x: 700, y: 120 },
      { type: "sign", x: 1100, y: 330 }, // To Overlook
      // Crates
      { type: "crate", x: 200, y: 150 },
      { type: "crate", x: 220, y: 170 },
      { type: "gasPump", x: 620, y: 150 },
      // Road details are rendered programmatically in the engine, but we add trees
      { type: "tree", x: 260, y: 60 },
      { type: "tree", x: 320, y: 70 },
      { type: "tree", x: 380, y: 50 },
      { type: "tree", x: 120, y: 500 },
      { type: "tree", x: 180, y: 520 },
      { type: "tree", x: 240, y: 500 },
      { type: "tree", x: 300, y: 530 },
      { type: "tree", x: 520, y: 510 },
      { type: "tree", x: 580, y: 530 },
      { type: "tree", x: 640, y: 500 },
      { type: "tree", x: 700, y: 520 },
      { type: "tree", x: 760, y: 510 },
    ],
  },
  4: {
    id: 4,
    name: "The Garage",
    width: 700,
    height: 550,
    spawnPoint: { x: 350, y: 450 }, // Enters from the bottom door
    collisions: [
      // Wall boundaries (inside garage)
      { x: 0, y: 0, w: 700, h: 60 },
      { x: 0, y: 510, w: 700, h: 40 },
      { x: 0, y: 0, w: 40, h: 550 },
      { x: 660, y: 0, w: 40, h: 550 },
      // Workbench, shelves, tires
      { x: 40, y: 60, w: 620, h: 60 }, // Long workbench against back wall
      { x: 80, y: 200, w: 80, h: 100 }, // Tires/crates left
      { x: 540, y: 200, w: 80, h: 100 }, // Shelves/barrels right
      // Motorcycle obstacle (player cannot walk directly over it)
      { x: 300, y: 180, w: 100, h: 80 },
    ],
    npcs: [], // There can be a projection of companion or guide, but we let dialogue trigger on motorcycle approach
    items: [
      {
        id: "memory04",
        name: "Glowing Polaroid",
        icon: "🖼️",
        x: 120,
        y: 320, // On tire pile
        width: 24,
        height: 24,
        type: "memory",
        memoryId: "memory04",
        collected: false,
      }
    ],
    decorations: [
      // Industrial crates/barrels
      { type: "crate", x: 80, y: 200 },
      { type: "barrel", x: 100, y: 240 },
      { type: "barrel", x: 560, y: 210 },
      { type: "crate", x: 540, y: 250 },
    ],
  },
  5: {
    id: 5,
    name: "The Final Road",
    width: 800,
    height: 600,
    spawnPoint: { x: 100, y: 320 },
    collisions: [
      // Sunset scenic overlook boundaries
      { x: 0, y: 0, w: 800, h: 120 }, // Mountain silhouette blocking top
      { x: 0, y: 480, w: 800, h: 120 }, // Cliff drop blocking bottom
      { x: 0, y: 0, w: 40, h: 600 }, // West boundary
      { x: 760, y: 0, w: 40, h: 600 }, // East boundary cliff
      // Overlook fence/guardrail
      { x: 40, y: 460, w: 720, h: 20 },
      // Motorcycle parked in center
      { x: 520, y: 280, w: 100, h: 60 },
    ],
    npcs: [
      {
        id: "companion",
        name: "Abdou",
        portrait: "/abdou.png",
        x: 620,
        y: 260,
        width: 32,
        height: 48,
        spriteType: "companion",
        dialogue: [], // Loaded from config
        interactRange: 80,
      }
    ],
    items: [],
    decorations: [
      // Beautiful flower beds at the overlook
      { type: "flower", x: 200, y: 430, color: "#f43f5e" },
      { type: "flower", x: 220, y: 440, color: "#ec4899" },
      { type: "flower", x: 380, y: 430, color: "#f43f5e" },
      { type: "flower", x: 400, y: 440, color: "#eab308" },
      // Clouds (sunset background objects)
      { type: "cloud", x: 120, y: 150 },
      { type: "cloud", x: 380, y: 100 },
      { type: "cloud", x: 600, y: 180 },
    ],
  },
};
