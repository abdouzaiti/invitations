/**
 * TYPES FOR THE RIDE RPG GAME
 */

export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type AreaId = 1 | 2 | 3 | 4 | 5;

export interface NPC {
  id: string;
  name: string;
  portrait: string; // Name/type of portrait to render or color
  x: number;
  y: number;
  width: number;
  height: number;
  spriteType: "guide" | "traveler" | "mechanic" | "companion";
  dialogue: string[];
  interactRange: number;
  hasQuestTrigger?: string;
  requiredItem?: string;
}

export interface ItemObject {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "helmet" | "key" | "memory";
  memoryId?: string; // If type is "memory", which memory it connects to
  collected: boolean;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  status: "inactive" | "active" | "completed";
}

export interface DialogueState {
  npcName: string;
  npcPortrait: string;
  lines: string[];
  currentLineIndex: number;
  typedText: string;
  isTyping: boolean;
  onComplete?: () => void;
}

export interface GameSaveState {
  playerPosition: Position;
  playerDirection: Direction;
  currentArea: AreaId;
  inventory: string[];
  discoveredMemories: string[];
  completedQuests: string[];
  currentQuestId: string | null;
}
