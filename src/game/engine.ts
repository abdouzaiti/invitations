import { AreaId, Direction, Position, NPC, ItemObject, DialogueState, Quest } from "./types";
import { MAP_AREAS, MapArea } from "./maps";
import { GameRenderer } from "./renderer";
import { GAME_CONFIG, ROMANTIC_COLORS } from "./config";
import { GAME_AUDIO } from "./audio";

export interface EngineState {
  currentArea: AreaId;
  playerPosition: Position;
  playerDirection: Direction;
  inventory: string[];
  discoveredMemories: string[];
  dialogue: DialogueState | null;
  activeQuest: Quest | null;
  isMotorcycleUncovered: boolean;
  isGameFinished: boolean;
  finalDateCardVisible: boolean;
  endingChoiceSelected: boolean;
  isFinalDialogueCinematic: boolean;
  isEndingDisappearance: boolean;
  endingPhase: "prompt" | "scene1" | "scene2" | "scene3" | "scene4" | "credits" | null;
  endingOffset: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: GameRenderer;
  private state: EngineState;
  private onStateChange: (state: EngineState) => void;

  // Input states
  private keys: Record<string, boolean> = {};
  private activeTouchDir: Direction | null = null;
  private touchVector: { x: number; y: number } | null = null;

  // Simulation variables
  private camera: Position = { x: 0, y: 0 };
  private playerSpeed = 4;
  private isWalking = false;
  private walkFrameTimer = 0;
  
  // Game assets / runtime copies
  private areas: Record<AreaId, MapArea>;
  private particles: { x: number; y: number; s: number; a: number; vx: number; vy: number }[] = [];

  // Intervals / Typewriter variables
  private typewriterTimer: any = null;
  private isRunning = false;
  private animationId = 0;
  private isEndingDisappearance = false;

  constructor(
    canvas: HTMLCanvasElement,
    onStateChange: (state: EngineState) => void,
    initialState?: Partial<EngineState>
  ) {
    this.canvas = canvas;
    this.renderer = new GameRenderer(canvas);
    this.onStateChange = onStateChange;

    // Deep clone MAP_AREAS so restarts reset item collected flags and NPC positions cleanly
    this.areas = JSON.parse(JSON.stringify(MAP_AREAS));

    // Dynamic dialogue text injections based on config
    this.areas[1].npcs[0].dialogue = GAME_CONFIG.dialogues.guideIntro;
    this.areas[2].npcs[0].dialogue = GAME_CONFIG.dialogues.travelerTips;
    this.areas[3].npcs[0].dialogue = GAME_CONFIG.dialogues.mechanicClues;
    this.areas[5].npcs[0].dialogue = GAME_CONFIG.dialogues.finalMeeting;
    this.areas[5].npcs[0].name = `${GAME_CONFIG.senderName}`;

    // Load initial state
    this.state = {
      currentArea: 1,
      playerPosition: { ...this.areas[1].spawnPoint },
      playerDirection: "down",
      inventory: [],
      discoveredMemories: [],
      dialogue: null,
      activeQuest: null,
      isMotorcycleUncovered: false,
      isGameFinished: false,
      finalDateCardVisible: false,
      endingChoiceSelected: false,
      isFinalDialogueCinematic: false,
      isEndingDisappearance: false,
      endingPhase: null,
      endingOffset: 0,
      ...initialState,
    };

    // Load existing inventory into items array collected properties
    this.syncInventoryWithItems();

    // Set camera immediately on player
    const zoom = this.renderer.zoomScale;
    this.camera.x = (this.state.playerPosition.x + 16) - (this.canvas.width / 2) / zoom;
    this.camera.y = (this.state.playerPosition.y + 16) - (this.canvas.height / 2) / zoom;

    this.setupListeners();
    this.spawnSunsetParticles();
    this.notifyState();
  }

  private syncInventoryWithItems() {
    Object.values(this.areas).forEach((area) => {
      area.items.forEach((item) => {
        if (
          this.state.inventory.includes(item.id) ||
          (item.memoryId && this.state.discoveredMemories.includes(item.memoryId))
        ) {
          item.collected = true;
        }
      });
    });
  }

  private notifyState() {
    this.onStateChange({ ...this.state });
  }

  private setupListeners() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // If dialog is open, bypass standard WASD and capture Advance keys
    if (this.state.dialogue) {
      if (e.key === "e" || e.key === "E" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.advanceDialogue();
      }
      return;
    }

    const key = e.key.toLowerCase();
    this.keys[key] = true;

    // Handle interact button
    if (key === "e" || e.key === " ") {
      e.preventDefault();
      this.handleInteraction();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
  };

  /**
   * Virtual Joystick / D-pad triggers for mobile gameplay
   */
  public setMobileDirection(dir: Direction | null) {
    if (this.state.dialogue) return;
    this.activeTouchDir = dir;
    this.touchVector = null;
  }

  public setMobileVector(vx: number, vy: number) {
    if (this.state.dialogue) return;
    if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
      this.touchVector = null;
      this.activeTouchDir = null;
    } else {
      this.touchVector = { x: vx, y: vy };
      if (Math.abs(vx) > Math.abs(vy)) {
        this.state.playerDirection = vx > 0 ? "right" : "left";
      } else {
        this.state.playerDirection = vy > 0 ? "down" : "up";
      }
    }
  }

  public setZoomScale(scale: number) {
    this.renderer.zoomScale = scale;
  }

  public triggerMobileInteract() {
    if (this.state.dialogue) {
      this.advanceDialogue();
    } else {
      this.handleInteraction();
    }
  }

  /**
   * Core Game Loop
   */
  public start() {
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  private update() {
    this.renderer.updateAnimation();
    this.updateSunsetParticles();

    // Handle ending scrolling
    if (this.state.endingPhase === "scene3" || this.state.endingPhase === "scene4") {
      this.state.endingOffset += 2;
      this.notifyState();
    }

    // Skip player movement if dialogue or ending is active
    if (this.state.dialogue || (this.state.endingPhase && this.state.endingPhase !== "prompt")) {
      this.isWalking = false;
      return;
    }

    this.handleMovement();
    this.checkCameraFollow();
    this.checkAreaTransitions();
    this.checkProximityTriggers();
  }

  private handleMovement() {
    let dx = 0;
    let dy = 0;

    // Resolve keyboard input
    if (this.keys["w"] || this.keys["arrowup"]) {
      dy = -1;
      this.state.playerDirection = "up";
    } else if (this.keys["s"] || this.keys["arrowdown"]) {
      dy = 1;
      this.state.playerDirection = "down";
    }

    if (this.keys["a"] || this.keys["arrowleft"]) {
      dx = -1;
      this.state.playerDirection = "left";
    } else if (this.keys["d"] || this.keys["arrowright"]) {
      dx = 1;
      this.state.playerDirection = "right";
    }

    // Resolve mobile touch input override
    if (this.touchVector) {
      dx = this.touchVector.x;
      dy = this.touchVector.y;
    } else if (this.activeTouchDir) {
      dx = 0;
      dy = 0;
      this.state.playerDirection = this.activeTouchDir;
      if (this.activeTouchDir === "up") dy = -1;
      if (this.activeTouchDir === "down") dy = 1;
      if (this.activeTouchDir === "left") dx = -1;
      if (this.activeTouchDir === "right") dx = 1;
    }

    this.isWalking = dx !== 0 || dy !== 0;

    if (this.isWalking) {
      // Gentle walk bob sound effects
      this.walkFrameTimer += 1;
      if (this.walkFrameTimer % 18 === 0) {
        GAME_AUDIO.playFootstep();
      }

      // Normalise diagonal speed for keyboard discrete keys
      let speed = this.playerSpeed;
      if (!this.touchVector && dx !== 0 && dy !== 0) {
        speed = this.playerSpeed * 0.707;
      }

      const nextX = this.state.playerPosition.x + dx * speed;
      const nextY = this.state.playerPosition.y + dy * speed;

      // Axis-sliding collision checking
      const currentAreaObj = this.areas[this.state.currentArea];
      
      // Try X movement independently
      if (!this.checkCollision(nextX, this.state.playerPosition.y, currentAreaObj)) {
        this.state.playerPosition.x = nextX;
      }
      // Try Y movement independently
      if (!this.checkCollision(this.state.playerPosition.x, nextY, currentAreaObj)) {
        this.state.playerPosition.y = nextY;
      }
    } else {
      this.walkFrameTimer = 0;
    }
  }

  /**
   * Foot-aligned bounding box collision checking
   */
  private checkCollision(px: number, py: number, area: MapArea): boolean {
    // Player collision box coordinates
    const pw = 24;
    const ph = 16;
    const pxBox = px + 4;
    const pyBox = py + 32;

    // Check boundary boundaries
    if (pxBox < 0 || pxBox + pw > area.width) return true;
    if (pyBox < 0 || pyBox + ph > area.height) return true;

    // Check Predefined Area Colliders
    for (const box of area.collisions) {
      if (
        pxBox < box.x + box.w &&
        pxBox + pw > box.x &&
        pyBox < box.y + box.h &&
        pyBox + ph > box.y
      ) {
        return true;
      }
    }

    // Dynamic Chapter Barriers (Stops physical movement if previous chapter conditions are not completed)
    if (area.id === 1) {
      // Briars Gate closed if quest hasn't started yet
      const isClosed = this.state.activeQuest?.id !== "find_memories";
      if (isClosed) {
        const barrierBox = { x: 840, y: 290, w: 10, h: 80 };
        if (
          pxBox < barrierBox.x + barrierBox.w &&
          pxBox + pw > barrierBox.x &&
          pyBox < barrierBox.y + barrierBox.h &&
          pyBox + ph > barrierBox.y
        ) {
          return true;
        }
      }
    } else if (area.id === 2) {
      // Route 2 gate closed if they haven't found the second memory polaroid in Area 2
      const isClosed = !this.state.discoveredMemories.includes("memory02");
      if (isClosed) {
        const barrierBox = { x: 1040, y: 230, w: 10, h: 80 };
        if (
          pxBox < barrierBox.x + barrierBox.w &&
          pxBox + pw > barrierBox.x &&
          pyBox < barrierBox.y + barrierBox.h &&
          pyBox + ph > barrierBox.y
        ) {
          return true;
        }
      }
    } else if (area.id === 3) {
      // Mountain Toll gate closed until they gather all 4 memories and reveal the bike
      const isClosed = !(this.state.discoveredMemories.length === 4 && this.state.isMotorcycleUncovered);
      if (isClosed) {
        const barrierBox = { x: 1140, y: 260, w: 10, h: 140 };
        if (
          pxBox < barrierBox.x + barrierBox.w &&
          pxBox + pw > barrierBox.x &&
          pyBox < barrierBox.y + barrierBox.h &&
          pyBox + ph > barrierBox.y
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private checkCameraFollow() {
    // Center the camera exactly on the middle of the player sprite (Sarah is 32x32)
    const zoom = this.renderer.zoomScale;
    const targetCamX = (this.state.playerPosition.x + 16) - (this.canvas.width / 2) / zoom;
    const targetCamY = (this.state.playerPosition.y + 16) - (this.canvas.height / 2) / zoom;

    // Instant centering lock
    this.camera.x = targetCamX;
    this.camera.y = targetCamY;
  }

  /**
   * Seamless Transitions between Area Gates
   */
  private checkAreaTransitions() {
    const px = this.state.playerPosition.x;
    const py = this.state.playerPosition.y;
    const areaId = this.state.currentArea;

    if (areaId === 1 && px > 825) {
      // Gate to Area 2: Blocked until Guide talked to
      if (this.state.activeQuest?.id === "find_memories") {
        this.state.currentArea = 2;
        this.state.playerPosition = { x: 40, y: py };
        this.syncInventoryWithItems();
        this.notifyState();
      } else {
        // Prevent crossing the gate line and trigger explanatory dialogue
        this.state.playerPosition.x = 815;
        this.triggerLocalDialogue("System", "guide", [
          "The Eastern path is barred by the village Briars Gate.",
          "Maybe Coach Moh standing near the cozy house knows how to clear the way."
        ]);
      }
    } else if (areaId === 2 && px < 15) {
      // Back to Area 1
      this.state.currentArea = 1;
      this.state.playerPosition = { x: 815, y: py };
      this.syncInventoryWithItems();
      this.notifyState();
    } else if (areaId === 2 && px > 1025) {
      // Transition to Area 3 (The Road): Barred until memory 2 is collected
      if (this.state.discoveredMemories.includes("memory02")) {
        this.state.currentArea = 3;
        this.state.playerPosition = { x: 40, y: py };
        this.syncInventoryWithItems();
        this.notifyState();
      } else {
        // Prevent crossing and guide them to find memory 2
        this.state.playerPosition.x = 1015;
        this.triggerLocalDialogue("System", "traveler", [
          "The path ahead is blocked by the Route 2 checkpoint barricades.",
          "You must search the northern secret flower clearing to find the second Glowing Polaroid memory first!"
        ]);
      }
    } else if (areaId === 3 && px < 15) {
      // Back to Area 2
      this.state.currentArea = 2;
      this.state.playerPosition = { x: 1015, y: py };
      this.syncInventoryWithItems();
      this.notifyState();
    } else if (areaId === 3 && px > 1125) {
      // Transition to Area 5 (Overlook)
      // Only unlock if they have collected all 4 memories & motorcycle is uncovered
      if (this.state.discoveredMemories.length === 4 && this.state.isMotorcycleUncovered) {
        this.state.currentArea = 5;
        this.state.playerPosition = { x: 50, y: 320 };
        this.syncInventoryWithItems();
        this.notifyState();
      } else {
        this.state.playerPosition.x = 1115;
        this.triggerLocalDialogue("System", "traveler", [
          "The mountain toll gate leading to the Overlook is closed.",
          "You must gather all 4 memories and prepare your vintage motorcycle inside the highway garage first!"
        ]);
      }
    }
  }

  /**
   * High Proximity Event Triggers (e.g. approaching covered bike in Area 4)
   */
  private checkProximityTriggers() {
    if (this.state.currentArea === 4 && !this.state.isMotorcycleUncovered) {
      // Motorcycle coordinates: 350, 220
      const dist = this.getDistance(this.state.playerPosition, { x: 350, y: 220 });
      if (dist < 70) {
        // Trigger reveal event!
        this.state.isMotorcycleUncovered = true;
        GAME_AUDIO.playQuestComplete();
        this.notifyState();

        this.triggerLocalDialogue("The Garage Spirit", "traveler", GAME_CONFIG.dialogues.motorcycleFound, () => {
          // Change quest
          this.state.activeQuest = {
            id: "final_road",
            name: "THE FINAL OVERLOOK",
            description: `Follow the mountain road East. ${GAME_CONFIG.companionName} is waiting for you.`,
            status: "active"
          };
          this.notifyState();
        });
      }
    }

    // Automate meeting character in Area 5
    if (this.state.currentArea === 5 && !this.state.endingPhase && !this.state.isFinalDialogueCinematic) {
      // Companion position: 620, 260
      const dist = this.getDistance(this.state.playerPosition, { x: 620, y: 260 });
      if (dist < 60) {
        this.state.isFinalDialogueCinematic = true;
        this.notifyState();
        this.triggerLocalDialogue(`${GAME_CONFIG.senderName}`, "/abdou.png", GAME_CONFIG.dialogues.finalMeeting, () => {
          // Show the prompt instead of finishing immediately
          this.state.endingPhase = "prompt";
          this.notifyState();
        });
      }
    }
  }

  /**
   * Action handling for Space, E or Mobile Taps
   */
  private handleInteraction() {
    const area = this.areas[this.state.currentArea];

    // 1. Check NPC interaction
    for (const npc of area.npcs) {
      const dist = this.getDistance(this.state.playerPosition, { x: npc.x, y: npc.y });
      if (dist < npc.interactRange) {
        this.startDialogue(npc);
        return;
      }
    }

    // 2. Check Item pick-ups
    for (const item of area.items) {
      if (item.collected) continue;
      const dist = this.getDistance(this.state.playerPosition, { x: item.x, y: item.y });
      if (dist < 45) {
        this.collectItem(item);
        return;
      }
    }

    // 3. Garage Door Interaction in Area 3
    if (this.state.currentArea === 3) {
      // Garage door location at x: 820, y: 190
      const dist = this.getDistance(this.state.playerPosition, { x: 820, y: 190 });
      if (dist < 60) {
        if (this.state.inventory.includes("key")) {
          // Unlock and enter!
          GAME_AUDIO.playClick();
          this.state.currentArea = 4;
          this.state.playerPosition = { x: 350, y: 440 };
          this.syncInventoryWithItems();
          this.notifyState();
        } else {
          this.triggerLocalDialogue("The Locked Door", "traveler", [
            "The heavy iron doors of the garage are locked with an old padlock.",
            "A small key engraving is visible. You must find the rusty key!"
          ]);
        }
        return;
      }
    }

    // 4. Garage Exit in Area 4
    if (this.state.currentArea === 4) {
      // Exit rug at x: 350, y: 480
      if (this.state.playerPosition.y > 440) {
        this.state.currentArea = 3;
        this.state.playerPosition = { x: 820, y: 220 };
        this.syncInventoryWithItems();
        this.notifyState();
        return;
      }
    }
  }

  private collectItem(item: ItemObject) {
    if (item.collected) return;
    item.collected = true;
    GAME_AUDIO.playItemPickup();

    if (item.type === "memory" && item.memoryId) {
      if (!this.state.discoveredMemories.includes(item.memoryId)) {
        this.state.discoveredMemories.push(item.memoryId);
      }
      this.notifyState();

      // Open memory cinematic card overlay immediately!
      // This is handled by React capturing discoveredMemories state update
    } else {
      // Normal inventory item
      if (!this.state.inventory.includes(item.id)) {
        this.state.inventory.push(item.id);
      }
      this.notifyState();

      const itemNames: Record<string, string> = {
        helmet: "🏍️ OLD LEATHER HELMET",
        key: "🔑 RUSTY GARAGE KEY",
      };

      this.triggerLocalDialogue("Inventory", "traveler", [
        `Found item: ${itemNames[item.id] || item.name}!`,
        "It was added to your inventory journal."
      ]);
    }
  }

  /**
   * Dialogue System Typewriter implementation
   */
  private startDialogue(npc: NPC) {
    // Custom logic on Guide NPC
    if (npc.id === "guide" && !this.state.activeQuest) {
      this.state.activeQuest = {
        id: "find_memories",
        name: "FIND THE MEMORIES",
        description: "Explore the pathways to gather all 4 glowing memories.",
        status: "active"
      };
      this.notifyState();
    }

    this.triggerLocalDialogue(npc.name, npc.portrait, npc.dialogue);
  }

  public triggerLocalDialogue(
    name: string,
    portrait: string,
    lines: string[],
    onComplete?: () => void
  ) {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }

    this.state.dialogue = {
      npcName: name,
      npcPortrait: portrait,
      lines,
      currentLineIndex: 0,
      typedText: "",
      isTyping: true,
      onComplete,
    };

    this.notifyState();
    this.startTypewriter();
  }

  private startTypewriter() {
    const dialog = this.state.dialogue;
    if (!dialog) return;

    const line = dialog.lines[dialog.currentLineIndex];
    let charIdx = 0;
    dialog.typedText = "";
    dialog.isTyping = true;
    this.notifyState();

    this.typewriterTimer = setInterval(() => {
      if (charIdx < line.length) {
        dialog.typedText += line[charIdx];
        GAME_AUDIO.playTypewriter();
        charIdx++;
        this.notifyState();
      } else {
        dialog.isTyping = false;
        clearInterval(this.typewriterTimer);
        this.notifyState();
      }
    }, 25);
  }

  private advanceDialogue() {
    const dialog = this.state.dialogue;
    if (!dialog) return;

    if (dialog.isTyping) {
      // Force finish line typing instantly
      clearInterval(this.typewriterTimer);
      dialog.typedText = dialog.lines[dialog.currentLineIndex];
      dialog.isTyping = false;
      this.notifyState();
      return;
    }

    if (dialog.currentLineIndex < dialog.lines.length - 1) {
      // Next line
      dialog.currentLineIndex++;
      this.startTypewriter();
    } else {
      // Close dialogue
      const callback = dialog.onComplete;
      this.state.dialogue = null;
      this.notifyState();
      if (callback) callback();
    }
  }

  private render() {
    const area = this.areas[this.state.currentArea];
    
    // Pick matching base ground/sky color for the outer camera border void
    let bgColor = ROMANTIC_COLORS.blushPink; // Area 1 & 2 cozy field
    if (area.id === 3) bgColor = ROMANTIC_COLORS.blushPink; // Area 3
    else if (area.id === 4) bgColor = ROMANTIC_COLORS.cream; // Area 4 inside garage
    else if (area.id === 5) bgColor = ROMANTIC_COLORS.softLavender; // Area 5 mountain peak shadow
    
    this.renderer.clear(bgColor);

    // 1. Draw backgrounds and grids
    this.renderer.drawBackground(area.id, area.width, area.height, this.camera, this.state.endingOffset);

    // 2. Draw Dynamic Chapter Barriers (Wooden gates & checkpoints)
    if (area.id === 1) {
      this.renderer.drawBarrier(1, this.state.activeQuest?.id !== "find_memories", this.camera);
    } else if (area.id === 2) {
      this.renderer.drawBarrier(2, !this.state.discoveredMemories.includes("memory02"), this.camera);
    } else if (area.id === 3) {
      const isTollClosed = !(this.state.discoveredMemories.length === 4 && this.state.isMotorcycleUncovered);
      this.renderer.drawBarrier(3, isTollClosed, this.camera);
    }

    // Wrap remaining world objects in ending offset if active
    const ctx = this.canvas.getContext("2d")!;
    ctx.save();
    if (this.state.currentArea === 5 && this.state.endingOffset > 0) {
      ctx.scale(this.renderer.zoomScale, this.renderer.zoomScale);
      ctx.translate(-this.state.endingOffset, 0);
      ctx.scale(1/this.renderer.zoomScale, 1/this.renderer.zoomScale);
    }

    // 3. Draw static decorations (trees, houses, benches)
    this.renderer.drawDecorations(area.decorations, this.camera);

    // 4. Draw items (helmet, key, memories)
    area.items.forEach((item) => {
      this.renderer.drawItem(item, this.camera);
    });

    // 4. Draw Motorcycle (uncovered / covered in Area 4 & 5)
    if (this.state.currentArea === 4) {
      this.renderer.drawMotorcycle(300, 180, !this.state.isMotorcycleUncovered, this.camera);
    } else if (this.state.currentArea === 5 && !this.state.isEndingDisappearance) {
      this.renderer.drawMotorcycle(520, 280, false, this.camera);
    }

    // 5. Draw NPCs
    area.npcs.forEach((npc) => {
      if (this.state.isEndingDisappearance && this.state.currentArea === 5) return;
      this.renderer.drawNPC(npc, this.camera);
    });

    // 6. Draw Player
    if (!this.state.endingPhase || this.state.endingPhase === "prompt") {
      this.renderer.drawPlayer(
        this.state.playerPosition.x,
        this.state.playerPosition.y,
        this.state.playerDirection,
        this.isWalking,
        this.camera
      );
    }

    ctx.restore();

    // 4.5 Draw Ending Scene (Outside the offset, so it stays fixed on camera)
    if (this.state.currentArea === 5 && this.state.endingPhase && this.state.endingPhase.startsWith("scene")) {
      // Calculate center of screen in world coordinates
      const centerX = this.camera.x + (this.canvas.width / this.renderer.zoomScale) / 2;
      const centerY = this.camera.y + (this.canvas.height / this.renderer.zoomScale) / 2;
      
      // Draw centered on camera, slightly adjusted for the road height
      this.renderer.drawEndingScene(this.state.endingPhase, centerX, centerY + 40, this.camera);
    }

    // 6.5 Draw Petals
    this.renderer.drawPetals(area.width, area.height);

    // 7. Draw Sunset overlay spark particles
    if (this.state.currentArea === 5) {
      this.renderer.drawSunsetParticles(this.particles);
    }
  }

  /**
   * Procedural particle spark dynamics for Area 5
   */
  private spawnSunsetParticles() {
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        s: 2 + Math.random() * 3,
        a: 0.1 + Math.random() * 0.6,
        vx: -0.5 - Math.random() * 1, // drifting left
        vy: -0.2 - Math.random() * 0.6, // drifting up
      });
    }
  }

  private updateSunsetParticles() {
    if (this.state.currentArea !== 5) return;
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.a -= 0.002;

      // Wrap-around respawn
      if (p.x < 0 || p.y < 0 || p.a <= 0) {
        p.x = 800 + Math.random() * 50;
        p.y = 200 + Math.random() * 400;
        p.a = 0.4 + Math.random() * 0.5;
      }
    });
  }

  public startEndingJourney() {
    this.state.endingPhase = "scene1";
    this.state.isEndingDisappearance = true;
    this.notifyState();

    this.triggerLocalDialogue(`${GAME_CONFIG.senderName}`, "/abdou.png", ["Let's go take your helmet."], () => {
      this.state.endingPhase = "scene2";
      this.notifyState();
      
      this.triggerLocalDialogue(`${GAME_CONFIG.senderName}`, "/abdou.png", ["Great, now get in the bike."], () => {
        this.state.endingPhase = "scene3";
        this.notifyState();
        
        // Auto transition after 3s
        setTimeout(() => {
          this.state.endingPhase = "scene4";
          this.notifyState();
          
          // Final credits after 4s
          setTimeout(() => {
            this.state.endingPhase = "credits";
            this.state.isGameFinished = true;
            this.notifyState();
          }, 4000);
        }, 3000);
      });
    });
  }

  public cancelEndingPrompt() {
    this.state.endingPhase = null;
    this.state.isFinalDialogueCinematic = false; // Allow re-triggering if she walks away and back
    this.notifyState();
  }

  public setEndingDisappearance(val: boolean) {
    this.isEndingDisappearance = val;
    this.state.isEndingDisappearance = val;
    this.notifyState();
  }

  private getDistance(p1: Position, p2: Position): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
}
export default GameEngine;
