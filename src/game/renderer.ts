import { AreaId, Direction, NPC, ItemObject } from "./types";
import { GAME_CONFIG, ROMANTIC_COLORS } from "./config";
import { MapArea } from "./maps";

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrame = 0;
  public zoomScale = 0.8; // Decreased zoom from 1.0 to 0.8 to see more map space

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    // Enable crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  public updateAnimation() {
    this.animFrame = (this.animFrame + 1) % 60;
  }

  public clear(color = "#1e293b") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw the entire map background, roads, tiles, and boundaries
   */
  public drawBackground(
    areaId: AreaId,
    mapWidth: number,
    mapHeight: number,
    camera: { x: number; y: number }
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.zoomScale, this.zoomScale);
    ctx.translate(-camera.x, -camera.y);

    if (areaId === 1 || areaId === 2) {
      // Village or Memory Path: Cozy Romantic field
      ctx.fillStyle = ROMANTIC_COLORS.blushPink; // Base grass color
      ctx.fillRect(0, 0, mapWidth, mapHeight);

      // Draw subtle grassy patterns & pathways
      ctx.fillStyle = ROMANTIC_COLORS.pastelPink;
      for (let gx = 0; gx < mapWidth; gx += 64) {
        for (let gy = 0; gy < mapHeight; gy += 64) {
          if ((gx + gy) % 128 === 0) {
            // Tiny grass blades (now flower details)
            ctx.fillRect(gx + 10, gy + 15, 4, 8);
            ctx.fillRect(gx + 14, gy + 19, 4, 4);
            ctx.fillRect(gx + 40, gy + 45, 4, 8);
          }
        }
      }

      // Draw romantic paths
      ctx.fillStyle = ROMANTIC_COLORS.cream; // Soft path color
      if (areaId === 1) {
        // Broad central horizontal village pathway running to the edges
        ctx.fillRect(0, 290, mapWidth, 80);
        // Pathway to Guide's house
        ctx.fillRect(350, 180, 60, 110);
        // Path to Well
        ctx.fillRect(150, 190, 40, 100);
      } else {
        // Curved memory path winding through the trees and running all the way to the edges
        ctx.fillRect(0, 290, 440, 80);
        ctx.fillRect(400, 230, 80, 140);
        ctx.fillRect(400, 230, mapWidth - 400, 80);
        // Path leading north-east to the secret clearing
        ctx.fillRect(800, 120, 80, 120);
        ctx.fillRect(800, 120, 150, 80);
      }
    } else if (areaId === 3) {
      // The Road
      ctx.fillStyle = ROMANTIC_COLORS.blushPink; // Grass around the highway
      ctx.fillRect(0, 0, mapWidth, mapHeight);

      // Grass details
      ctx.fillStyle = ROMANTIC_COLORS.pastelPink;
      for (let gx = 0; gx < mapWidth; gx += 80) {
        for (let gy = 0; gy < mapHeight; gy += 80) {
          ctx.fillRect(gx + 15, gy + 20, 4, 8);
        }
      }

      // Large highway asphalt road
      ctx.fillStyle = "#f5f5f5"; // Lighter asphalt grey
      ctx.fillRect(0, 260, mapWidth, 140);

      // Road shoulder lines (white)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 260, mapWidth, 4);
      ctx.fillRect(0, 396, mapWidth, 4);

      // Road dashed double lines (yellow)
      ctx.fillStyle = "#eab308";
      const dashWidth = 40;
      const gapWidth = 30;
      for (let rx = 0; rx < mapWidth; rx += dashWidth + gapWidth) {
        ctx.fillRect(rx, 327, dashWidth, 3);
        ctx.fillRect(rx, 331, dashWidth, 3);
      }

      // Fuel station cement area
      ctx.fillStyle = "#374151";
      ctx.fillRect(560, 120, 180, 140);
    } else if (areaId === 4) {
      // The Inside Garage
      ctx.fillStyle = ROMANTIC_COLORS.darkPlum; // Dark surrounding
      ctx.fillRect(0, 0, mapWidth, mapHeight);

      // Garage concrete tile grid
      ctx.fillStyle = ROMANTIC_COLORS.cream;
      ctx.fillRect(40, 60, mapWidth - 80, mapHeight - 100);

      ctx.fillStyle = ROMANTIC_COLORS.softLavender; // Grid grooves
      for (let gx = 40; gx < mapWidth - 40; gx += 40) {
        ctx.fillRect(gx, 60, 2, mapHeight - 100);
      }
      for (let gy = 60; gy < mapHeight - 40; gy += 40) {
        ctx.fillRect(40, gy, mapWidth - 80, 2);
      }

      // Entrance rug at bottom center
      ctx.fillStyle = ROMANTIC_COLORS.rosePink;
      ctx.fillRect(mapWidth / 2 - 50, mapHeight - 65, 100, 25);
    } else if (areaId === 5) {
      // The Overlook: Beautiful sunset background behind the road
      // Since it's an overlook, we draw the sunset sky in the upper portion
      const sunsetGradient = ctx.createLinearGradient(0, 0, 0, 260);
      sunsetGradient.addColorStop(0, "#1e1b4b"); // Deep indigo midnight
      sunsetGradient.addColorStop(0.3, "#4c1d95"); // Deep purple
      sunsetGradient.addColorStop(0.6, "#7c2d12"); // Rich rust orange
      sunsetGradient.addColorStop(0.85, "#ca8a04"); // Golden light
      sunsetGradient.addColorStop(1, "#fef08a"); // Bright horizon yellow
      ctx.fillStyle = sunsetGradient;
      ctx.fillRect(0, 0, mapWidth, 260);

      // Draw setting sun
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(400, 210, 50, 0, Math.PI, true); // Sun half-dipped into horizon
      ctx.fill();

      // Sun halo rays
      ctx.fillStyle = "rgba(254, 240, 138, 0.15)";
      ctx.beginPath();
      ctx.arc(400, 210, 85, 0, Math.PI, true);
      ctx.fill();

      // Mountains Silhouette
      ctx.fillStyle = "#2e1047"; // Purple mountains
      ctx.beginPath();
      ctx.moveTo(0, 260);
      ctx.lineTo(80, 180);
      ctx.lineTo(180, 220);
      ctx.lineTo(310, 140);
      ctx.lineTo(450, 210);
      ctx.lineTo(580, 150);
      ctx.lineTo(720, 200);
      ctx.lineTo(800, 160);
      ctx.lineTo(800, 260);
      ctx.closePath();
      ctx.fill();

      // Secondary layered mountains (closer, darker)
      ctx.fillStyle = "#1e0b30";
      ctx.beginPath();
      ctx.moveTo(0, 260);
      ctx.lineTo(120, 210);
      ctx.lineTo(240, 240);
      ctx.lineTo(380, 180);
      ctx.lineTo(510, 230);
      ctx.lineTo(650, 190);
      ctx.lineTo(800, 230);
      ctx.lineTo(800, 260);
      ctx.closePath();
      ctx.fill();

      // Flying bird silhouettes in the sky
      ctx.fillStyle = "rgba(15, 10, 25, 0.4)";
      const birdOffset = (this.animFrame * 0.4) % 120;
      const drawBird = (bx: number, by: number) => {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + 6, by - 6, bx + 12, by);
        ctx.quadraticCurveTo(bx + 18, by - 6, bx + 24, by);
        ctx.quadraticCurveTo(bx + 12, by - 2, bx, by);
        ctx.fill();
      };
      drawBird(150 + birdOffset, 100);
      drawBird(180 + birdOffset, 120);
      drawBird(140 + birdOffset, 135);

      // Overlook Ground: Mountain peak asphalt road
      ctx.fillStyle = "#130a1c"; // Very deep sunset shadows grass
      ctx.fillRect(0, 260, mapWidth, mapHeight - 260);

      // Paved overlook roadway
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 280, mapWidth, 160);

      // White boundary lines
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(0, 280, mapWidth, 4);
      ctx.fillRect(0, 436, mapWidth, 4);

      // Yellow double centerline
      ctx.fillStyle = "#eab308";
      const dashWidth = 35;
      const gapWidth = 20;
      for (let rx = 0; rx < mapWidth; rx += dashWidth + gapWidth) {
        ctx.fillRect(rx, 357, dashWidth, 2);
        ctx.fillRect(rx, 361, dashWidth, 2);
      }

      // Draw wooden look-out deck fence
      ctx.fillStyle = "#5c2d17"; // Brown wood
      for (let fx = 40; fx < mapWidth - 40; fx += 50) {
        ctx.fillRect(fx, 440, 10, 30); // Vertical posts
      }
      ctx.fillRect(40, 442, mapWidth - 80, 6); // Top horizontal rail
      ctx.fillRect(40, 456, mapWidth - 80, 6); // Middle horizontal rail
    }

    ctx.restore();
  }

  /**
   * Draw decorative assets like houses, trees, flowers, signs
   */
  public drawDecorations(
    decorations: MapArea["decorations"],
    camera: { x: number; y: number }
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.zoomScale, this.zoomScale);
    ctx.translate(-camera.x, -camera.y);

    const sway = Math.sin(this.animFrame * 0.08) * 2;

    decorations.forEach((dec) => {
      ctx.save();
      ctx.translate(dec.x, dec.y);

      if (dec.type === "tree") {
        // High-fidelity procedurally drawn pixel-art pine tree
        ctx.save();
        ctx.translate(16, 20);
        ctx.scale(1.8, 1.8);
        ctx.translate(-16, -20);

        // Brown trunk
        ctx.fillStyle = "#57534e";
        ctx.fillRect(12, 40, 8, 20);
        
        // Base dark foliage shadow circle
        ctx.fillStyle = ROMANTIC_COLORS.dustyRose;
        ctx.fillRect(2, 38, 28, 4);

        // Pine triangles (3 layers)
        // Layer 3 (Bottom)
        ctx.fillStyle = ROMANTIC_COLORS.rosePink;
        ctx.beginPath();
        ctx.moveTo(16, 15);
        ctx.lineTo(-4 + sway * 0.1, 40);
        ctx.lineTo(36 + sway * 0.1, 40);
        ctx.closePath();
        ctx.fill();

        // Layer 2 (Middle)
        ctx.fillStyle = ROMANTIC_COLORS.pastelPink;
        ctx.beginPath();
        ctx.moveTo(16, 5);
        ctx.lineTo(0 + sway * 0.3, 26);
        ctx.lineTo(32 + sway * 0.3, 26);
        ctx.closePath();
        ctx.fill();

        // Layer 1 (Top)
        ctx.fillStyle = ROMANTIC_COLORS.blushPink;
        ctx.beginPath();
        ctx.moveTo(16 + sway * 0.5, -5);
        ctx.lineTo(4 + sway * 0.5, 14);
        ctx.lineTo(28 + sway * 0.5, 14);
        ctx.closePath();
        ctx.fill();

        // Subtle highlight dots (simulating 16-bit texturing)
        ctx.fillStyle = ROMANTIC_COLORS.warmWhite;
        ctx.fillRect(10 + sway * 0.5, 8, 3, 3);
        ctx.fillRect(18 + sway * 0.3, 20, 4, 3);
        ctx.fillRect(8 + sway * 0.1, 32, 3, 4);
        ctx.restore();
      } else if (dec.type === "house") {
        // Village house or Garage
        // Shadow base
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(-10, 110, 180, 20);

        // Main brick walls
        ctx.fillStyle = "#e2e8f0"; // Cream bricks
        ctx.fillRect(0, 40, 160, 80);

        // Brick outlines
        ctx.fillStyle = "#cbd5e1";
        for (let bx = 10; bx < 150; bx += 30) {
          ctx.fillRect(bx, 60, 10, 4);
          ctx.fillRect(bx - 15, 90, 10, 4);
        }

        // Roof shadow
        ctx.fillStyle = "#a8a29e";
        ctx.fillRect(0, 40, 160, 5);

        // Tiled Gable Roof (Deep Orange/Red-Brown)
        ctx.fillStyle = "#9a3412"; // Primary roof color
        ctx.beginPath();
        ctx.moveTo(80, -10);
        ctx.lineTo(-15, 42);
        ctx.lineTo(175, 42);
        ctx.closePath();
        ctx.fill();

        // Highlight roof lines
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.moveTo(80, -10);
        ctx.lineTo(0, 34);
        ctx.lineTo(160, 34);
        ctx.closePath();
        ctx.fill();

        // Chimney
        ctx.fillStyle = "#44403c";
        ctx.fillRect(120, 5, 15, 25);
        ctx.fillStyle = "#78716c";
        ctx.fillRect(118, 5, 19, 4);

        // Smoke particles blowing from chimney
        const smokePulse = (this.animFrame % 20) / 20;
        ctx.fillStyle = "rgba(200, 200, 200, 0.4)";
        ctx.beginPath();
        ctx.arc(
          127 + Math.sin(this.animFrame * 0.1) * 6,
          -5 - smokePulse * 25,
          6 + smokePulse * 5,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Front Door
        ctx.fillStyle = "#78350f"; // Rich wood brown
        ctx.fillRect(65, 80, 30, 40);
        ctx.fillStyle = "#facc15"; // Brass handle
        ctx.fillRect(70, 100, 3, 3);

        // Cozy windows with glowing light
        ctx.fillStyle = "#1e293b"; // Window frames
        ctx.fillRect(20, 65, 24, 24);
        ctx.fillRect(116, 65, 24, 24);

        // Yellow glow if active
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(22, 67, 20, 20);
        ctx.fillRect(118, 67, 20, 20);

        ctx.fillStyle = "#0f172a"; // Window glass divider lines
        ctx.fillRect(31, 67, 2, 20);
        ctx.fillRect(22, 76, 20, 2);
        ctx.fillRect(127, 67, 2, 20);
        ctx.fillRect(118, 76, 20, 2);
      } else if (dec.type === "well") {
        // Village brick well
        ctx.fillStyle = "#475569"; // Stone grey
        ctx.fillRect(0, 20, 40, 20);
        ctx.fillStyle = "#334155";
        ctx.fillRect(0, 25, 4, 15);
        ctx.fillRect(36, 25, 4, 15);
        
        // Pillars
        ctx.fillStyle = "#78350f";
        ctx.fillRect(8, -2, 4, 22);
        ctx.fillRect(28, -2, 4, 22);

        // Well roof
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.moveTo(20, -10);
        ctx.lineTo(2, 0);
        ctx.lineTo(38, 0);
        ctx.closePath();
        ctx.fill();
      } else if (dec.type === "bench") {
        // Cozy wooden park bench
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(-2, 26, 64, 8); // Shadow

        ctx.fillStyle = "#5c2d17"; // Wood legs
        ctx.fillRect(2, 12, 4, 16);
        ctx.fillRect(54, 12, 4, 16);

        ctx.fillStyle = "#b45309"; // Seat slats
        ctx.fillRect(0, 8, 60, 6);
        ctx.fillRect(0, 0, 60, 6); // Backrest

        ctx.fillStyle = "#78350f"; // Connectors
        ctx.fillRect(4, 4, 4, 6);
        ctx.fillRect(52, 4, 4, 6);
      } else if (dec.type === "sign") {
        // Wooden trail signpost
        ctx.fillStyle = "#78350f"; // Post
        ctx.fillRect(10, 10, 4, 24);
        ctx.fillStyle = "#b45309"; // Arrow sign board
        ctx.fillRect(0, 0, 24, 10);
        ctx.fillStyle = "#fef08a"; // Letter details
        ctx.fillRect(4, 4, 14, 2);
      } else if (dec.type === "gasPump") {
        // Vintage gas pump
        ctx.fillStyle = "#dc2626"; // Vibrant retro red
        ctx.fillRect(0, 0, 22, 44);
        ctx.fillStyle = "#f3f4f6"; // Dial glass
        ctx.fillRect(3, 6, 16, 12);
        ctx.fillStyle = "#111827"; // Needle pointer
        ctx.fillRect(10, 11, 2, 4);
        // Hose attachment
        ctx.strokeStyle = "#4b5563";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(19, 20);
        ctx.bezierCurveTo(28, 25, 26, 40, 19, 40);
        ctx.stroke();
      } else if (dec.type === "crate") {
        ctx.fillStyle = "#854d0e";
        ctx.fillRect(0, 0, 24, 24);
        ctx.fillStyle = "#a16207";
        ctx.fillRect(2, 2, 20, 20);
        ctx.fillStyle = "#713f12"; // Diagonal cross planks
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(2, 2); ctx.lineTo(22, 22);
        ctx.moveTo(2, 22); ctx.lineTo(22, 2);
        ctx.stroke();
      } else if (dec.type === "barrel") {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, 18, 26);
        ctx.fillStyle = "#0f172a"; // Metal rings
        ctx.fillRect(0, 6, 18, 3);
        ctx.fillRect(0, 17, 18, 3);
      } else if (dec.type === "flower") {
        // Small adorable swaying flower
        const flowerSway = Math.sin(this.animFrame * 0.1 + dec.x) * 3;
        ctx.fillStyle = "#166534"; // Stem
        ctx.fillRect(0, 4, 2, 8);
        ctx.fillStyle = dec.color || "#f43f5e"; // Petals
        ctx.beginPath();
        ctx.arc(flowerSway, 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#facc15"; // Yellow core
        ctx.beginPath();
        ctx.arc(flowerSway, 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (dec.type === "shrub") {
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.arc(10, 14, 10, 0, Math.PI * 2);
        ctx.arc(22, 14, 12, 0, Math.PI * 2);
        ctx.arc(14, 8, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (dec.type === "cloud") {
        // Slow drifting clouds in sunset sky (Area 5 background)
        ctx.fillStyle = "rgba(251, 146, 60, 0.25)"; // Warm orange translucent cloud
        const cloudX = (dec.x + this.animFrame * 0.15) % 800;
        ctx.beginPath();
        ctx.arc(cloudX, dec.y, 25, 0, Math.PI * 2);
        ctx.arc(cloudX + 30, dec.y - 10, 35, 0, Math.PI * 2);
        ctx.arc(cloudX + 65, dec.y + 5, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Render the player character in pixel style with simple sprite bobbing
   */
  public drawPlayer(
    x: number,
    y: number,
    dir: Direction,
    isWalking: boolean,
    camera: { x: number; y: number }
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.zoomScale, this.zoomScale);
    ctx.translate(x - camera.x, y - camera.y);

    // Dynamic walking bob animation
    const bob = isWalking ? Math.floor((this.animFrame / 10) % 4) : 0;
    const bodyBobY = (bob === 1 || bob === 3) ? -2 : 0;
    const limbSwing = (bob === 1) ? 3 : (bob === 3) ? -3 : 0;

    // Player Shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(16, 44, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. LEGS (Blue jeans)
    ctx.fillStyle = "#2563eb"; // Blue jeans
    if (isWalking) {
      // Left leg
      ctx.fillRect(8, 30 + (bob === 1 ? -2 : 0), 6, 12);
      // Right leg
      ctx.fillRect(18, 30 + (bob === 3 ? -2 : 0), 6, 12);
      // Brown boots
      ctx.fillStyle = "#78350f";
      ctx.fillRect(7, 40 + (bob === 1 ? -2 : 0), 8, 4);
      ctx.fillRect(17, 40 + (bob === 3 ? -2 : 0), 8, 4);
    } else {
      ctx.fillRect(8, 30, 7, 12);
      ctx.fillRect(17, 30, 7, 12);
      // Brown boots
      ctx.fillStyle = "#78350f";
      ctx.fillRect(7, 40, 9, 4);
      ctx.fillRect(16, 40, 9, 4);
    }

    // 2. TORSO / JACKET (Sleek black leather jacket with purple highlights)
    ctx.fillStyle = "#1f2937"; // Dark black leather jacket
    ctx.fillRect(6, 14 + bodyBobY, 20, 18);
    // Purple scarf / undershirt
    ctx.fillStyle = "#ca8a04"; // Gold zipper/button detail
    ctx.fillRect(15, 14 + bodyBobY, 2, 18);
    ctx.fillStyle = "#c084fc"; // Purple scarf collar
    ctx.fillRect(10, 14 + bodyBobY, 12, 4);

    // 3. ARMS / HANDS (Swaying when walking)
    ctx.fillStyle = "#111827"; // Darker sleeves
    if (dir === "up" || dir === "down") {
      ctx.fillRect(2, 16 + bodyBobY + limbSwing, 4, 12);
      ctx.fillRect(26, 16 + bodyBobY - limbSwing, 4, 12);
      // Skin tone hands
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(2, 28 + bodyBobY + limbSwing, 4, 4);
      ctx.fillRect(26, 28 + bodyBobY - limbSwing, 4, 4);
    } else if (dir === "left") {
      ctx.fillRect(14, 16 + bodyBobY + limbSwing, 4, 12);
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(14, 28 + bodyBobY + limbSwing, 4, 4);
    } else if (dir === "right") {
      ctx.fillRect(14, 16 + bodyBobY - limbSwing, 4, 12);
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(14, 28 + bodyBobY - limbSwing, 4, 4);
    }

    // 4. HEAD / FACE / HAIR (Sarah - Gorgeous cascading Chestnut Hair)
    ctx.fillStyle = "#ffedd5"; // Soft warm skin tone
    ctx.fillRect(8, 2 + bodyBobY, 16, 12);

    // Deep chestnut cascading hair
    ctx.fillStyle = "#7c2d12"; // Deep chestnut brown
    ctx.fillRect(6, -3 + bodyBobY, 20, 5); // Hair top
    ctx.fillRect(6, 2 + bodyBobY, 4, 15); // Left lock falling down
    ctx.fillRect(22, 2 + bodyBobY, 4, 15); // Right lock falling down
    ctx.fillRect(12, -4 + bodyBobY, 8, 2); // Small hair bun clip

    // Face features based on direction
    ctx.fillStyle = "#0f172a"; // Eye color (dark blue/black)
    if (dir === "down") {
      ctx.fillRect(11, 6 + bodyBobY, 2, 3); // Left eye
      ctx.fillRect(19, 6 + bodyBobY, 2, 3); // Right eye
      ctx.fillStyle = "#fda4af"; // Pink blushing cheeks
      ctx.fillRect(9, 9 + bodyBobY, 2, 2);
      ctx.fillRect(21, 9 + bodyBobY, 2, 2);
    } else if (dir === "left") {
      ctx.fillRect(9, 6 + bodyBobY, 2, 3);
      ctx.fillStyle = "#fda4af";
      ctx.fillRect(8, 9 + bodyBobY, 2, 2);
    } else if (dir === "right") {
      ctx.fillRect(21, 6 + bodyBobY, 2, 3);
      ctx.fillStyle = "#fda4af";
      ctx.fillRect(22, 9 + bodyBobY, 2, 2);
    } else if (dir === "up") {
      // Back of hair cascading further down over the back
      ctx.fillStyle = "#7c2d12";
      ctx.fillRect(6, 2 + bodyBobY, 20, 16);
    }

    ctx.restore();
  }

  /**
   * Draw NPCs with beautiful breathing idle bob
   */
  public drawNPC(
    npc: NPC,
    camera: { x: number; y: number }
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.zoomScale, this.zoomScale);
    ctx.translate(npc.x - camera.x, npc.y - camera.y);

    const bob = Math.sin(this.animFrame * 0.1 + npc.x) * 1.5;

    // NPC Shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(16, 44, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Custom Sprite Rendering based on NPC type
    if (npc.spriteType === "guide") {
      // The Elder Guide (Sage blue long robe, grey beard)
      ctx.fillStyle = "#1e3a8a"; // Deep blue robe
      ctx.fillRect(6, 12 + bob, 20, 24);
      ctx.fillRect(4, 18 + bob, 24, 18); // Sleeves
      
      // Face
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(9, 2 + bob, 14, 10);
      
      // Grey beard and hood
      ctx.fillStyle = "#cbd5e1"; // Beard
      ctx.fillRect(9, 9 + bob, 14, 12);
      ctx.fillRect(11, 21 + bob, 10, 4);
      
      ctx.fillStyle = "#172554"; // Dark blue hood
      ctx.fillRect(7, -1 + bob, 18, 4);
      ctx.fillRect(6, 3 + bob, 3, 10);
      ctx.fillRect(23, 3 + bob, 3, 10);

      // Staff
      ctx.fillStyle = "#78350f"; // Staff wood
      ctx.fillRect(27, -4 + bob, 3, 44);
      ctx.fillStyle = "#38bdf8"; // Blue gem on top
      ctx.fillRect(26, -9 + bob, 5, 5);
    } else if (npc.spriteType === "traveler") {
      // Old Traveler (Explorer outfit, hat, backpack)
      // Backpack (behind torso, so draw first)
      ctx.fillStyle = "#7c2d12"; // Rugged leather brown
      ctx.fillRect(2, 16 + bob, 6, 14);

      // Torso
      ctx.fillStyle = "#b45309"; // Khaki vest
      ctx.fillRect(8, 14 + bob, 16, 18);
      ctx.fillStyle = "#fef08a"; // Yellow neckerchief
      ctx.fillRect(13, 14 + bob, 6, 3);

      // Legs
      ctx.fillStyle = "#4b5563"; // Dark grey trousers
      ctx.fillRect(9, 31, 6, 11);
      ctx.fillRect(17, 31, 6, 11);
      // Boots
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(8, 41, 8, 3);
      ctx.fillRect(16, 41, 8, 3);

      // Face & Hat
      ctx.fillStyle = "#ffedd5";
      ctx.fillRect(9, 4 + bob, 14, 10);
      ctx.fillStyle = "#ca8a04"; // Explorer yellow hat
      ctx.fillRect(5, 1 + bob, 22, 4); // Brim
      ctx.fillRect(8, -4 + bob, 16, 5); // Crown

      // Black specs / eyes
      ctx.fillStyle = "#000000";
      ctx.fillRect(12, 7 + bob, 2, 2);
      ctx.fillRect(18, 7 + bob, 2, 2);
    } else if (npc.spriteType === "mechanic") {
      // Slick the Mechanic (Cap, dungarees, wrench)
      // Torso/Dungarees
      ctx.fillStyle = "#ffffff"; // White undershirt
      ctx.fillRect(8, 14 + bob, 16, 18);
      ctx.fillStyle = "#0369a1"; // Blue overalls
      ctx.fillRect(9, 18 + bob, 14, 14);
      ctx.fillRect(9, 14 + bob, 3, 5); // Left strap
      ctx.fillRect(20, 14 + bob, 3, 5); // Right strap

      // Legs
      ctx.fillStyle = "#0369a1";
      ctx.fillRect(9, 31, 6, 11);
      ctx.fillRect(17, 31, 6, 11);
      ctx.fillStyle = "#475569"; // Steel toe boots
      ctx.fillRect(8, 41, 8, 3);
      ctx.fillRect(16, 41, 8, 3);

      // Face & Red Cap
      ctx.fillStyle = "#fed7aa";
      ctx.fillRect(9, 4 + bob, 14, 10);
      ctx.fillStyle = "#dc2626"; // Red cap
      ctx.fillRect(8, -2 + bob, 16, 7);
      ctx.fillRect(12, -2 + bob, 16, 3); // Bill

      // Eyes
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(12, 7 + bob, 2, 2);
      ctx.fillRect(18, 7 + bob, 2, 2);
    } else if (npc.spriteType === "companion") {
      // Alex (Adventure green jacket, handsome short brown hair, boots)
      // Legs (dark denim jeans)
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(8, 31, 6, 11);
      ctx.fillRect(18, 31, 6, 11);
      ctx.fillStyle = "#78350f"; // Brown boots
      ctx.fillRect(7, 40, 8, 4);
      ctx.fillRect(17, 40, 8, 4);

      // Torso (Adventure Green Jacket with zipper)
      ctx.fillStyle = "#15803d"; // Forest green jacket
      ctx.fillRect(6, 14 + bob, 20, 18);
      ctx.fillStyle = "#e2e8f0"; // Zipper line
      ctx.fillRect(15, 14 + bob, 2, 18);

      // Arms (resting coolly)
      ctx.fillStyle = "#166534"; // Darker sleeves
      ctx.fillRect(2, 16 + bob, 4, 12);
      ctx.fillRect(26, 16 + bob, 4, 12);

      // Face & Short Hair (Alex)
      ctx.fillStyle = "#fed7aa"; // Skin tone
      ctx.fillRect(9, 2 + bob, 14, 12);

      // Short handsome brown hair
      ctx.fillStyle = "#451a03"; // Brown hair
      ctx.fillRect(7, -2 + bob, 18, 5); // Hair top
      ctx.fillRect(7, 3 + bob, 3, 6); // Sideburn left
      ctx.fillRect(22, 3 + bob, 3, 6); // Sideburn right

      // Eyes
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(12, 6 + bob, 2, 3);
      ctx.fillRect(18, 6 + bob, 2, 3);
    }

    // Floating interaction prompt "E" if player is very close (bobbing slightly)
    ctx.restore();
  }

  /**
   * Render items like memory polaroids, helmets, keys
   */
  public drawItem(
    item: ItemObject,
    camera: { x: number; y: number }
  ) {
    if (item.collected) return;
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.zoomScale, this.zoomScale);
    ctx.translate(item.x - camera.x, item.y - camera.y);

    // Floating bobbing offset
    const floatOffset = Math.sin(this.animFrame * 0.1 + item.x) * 4;

    // Glowing ring effect around the item
    ctx.fillStyle = "rgba(251, 191, 36, 0.2)";
    ctx.beginPath();
    ctx.arc(12, 12 + floatOffset, 16 + Math.sin(this.animFrame * 0.15) * 4, 0, Math.PI * 2);
    ctx.fill();

    if (item.type === "memory") {
      // Draw a highly stylized pixel-art Polaroid floating item
      // Border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(2, 2 + floatOffset, 20, 22);
      // Photo area
      ctx.fillStyle = "#0284c7"; // Blue sky representation
      ctx.fillRect(4, 4 + floatOffset, 16, 14);
      // Sunset sun representation in photo
      ctx.fillStyle = "#facc15";
      ctx.fillRect(10, 10 + floatOffset, 4, 4);
      // Hearts/spark detail hovering over Polaroid
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(16, -4 + floatOffset, 3, 3);
      ctx.fillRect(6, 24 + floatOffset, 2, 2);
    } else if (item.type === "helmet") {
      // Draw a retro motorcycle helmet
      // Shell
      ctx.fillStyle = "#dc2626"; // Vibrant red helmet shell
      ctx.beginPath();
      ctx.arc(12, 12 + floatOffset, 10, 0, Math.PI * 2);
      ctx.fill();
      // Visor cutout
      ctx.fillStyle = "#0f172a"; // Dark black visor
      ctx.fillRect(12, 6 + floatOffset, 10, 6);
      ctx.fillStyle = "#38bdf8"; // Visor glare reflection
      ctx.fillRect(14, 7 + floatOffset, 3, 4);
      // Chin strap
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(8, 19 + floatOffset, 8, 3);
    } else if (item.type === "key") {
      // Glowing golden key
      ctx.fillStyle = "#ca8a04"; // Dark gold
      ctx.fillRect(8, 11 + floatOffset, 12, 3); // Stem
      ctx.beginPath();
      ctx.arc(6, 12 + floatOffset, 4, 0, Math.PI * 2); // Key ring
      ctx.fill();
      ctx.fillStyle = "#fef08a"; // Glowing inner gold
      ctx.fillRect(14, 14 + floatOffset, 2, 4); // Key teeth
      ctx.fillRect(18, 14 + floatOffset, 2, 4);
    }

    ctx.restore();
  }

  /**
   * Draw the beautiful detailed vintage motorcycle
   */
  public drawMotorcycle(
    x: number,
    y: number,
    isCovered: boolean,
    camera: { x: number; y: number }
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.scale(this.zoomScale, this.zoomScale);
    ctx.translate(x - camera.x, y - camera.y);

    if (isCovered) {
      // Covered motorcycle - Canvas sheet (mysterious drape)
      ctx.fillStyle = "rgba(0,0,0,0.3)"; // Shadow
      ctx.fillRect(-15, 48, 130, 15);

      // Drape canvas shape
      ctx.fillStyle = "#78716c"; // Brown canvas grey
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.lineTo(10, 20);
      ctx.lineTo(40, 10);
      ctx.lineTo(85, 25);
      ctx.lineTo(100, 50);
      ctx.closePath();
      ctx.fill();

      // Canvas highlights & folds
      ctx.fillStyle = "#a8a29e";
      ctx.fillRect(12, 22, 25, 4);
      ctx.fillRect(50, 26, 30, 4);

      // Ties and ropes
      ctx.strokeStyle = "#d6d3d1";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, 20); ctx.lineTo(25, 50);
      ctx.moveTo(60, 15); ctx.lineTo(65, 50);
      ctx.stroke();

      // Golden sparkling effects above the covered bike (curiosity!)
      const pulse = Math.sin(this.animFrame * 0.1) * 3;
      ctx.fillStyle = "rgba(253, 224, 71, 0.5)";
      ctx.fillRect(15, -5 + pulse, 4, 4);
      ctx.fillRect(75, 10 - pulse, 3, 3);
    } else {
      // UNCOVERED MOTORCYCLE: A spectacular handcrafted retro machine
      // Floor Shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(50, 48, 55, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 1. Spoked Wheels (Front and back)
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#1e293b"; // Heavy rubber tires
      ctx.fillStyle = "#cbd5e1"; // Silver spokes

      // Front wheel (Right side)
      ctx.beginPath();
      ctx.arc(80, 36, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Back wheel (Left side)
      ctx.beginPath();
      ctx.arc(16, 36, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Center hubs and metallic lines
      ctx.fillStyle = "#475569";
      ctx.fillRect(14, 34, 4, 4);
      ctx.fillRect(78, 34, 4, 4);

      // 2. Engine and Exhaust pipes (Silver & Iron)
      ctx.fillStyle = "#334155"; // Engine block
      ctx.fillRect(30, 22, 26, 18);
      ctx.fillStyle = "#94a3b8"; // Silver chrome cylinders
      ctx.fillRect(32, 20, 22, 3);

      // Long chrome exhaust pipe running back
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(28, 38, 45, 4);

      // 3. Chassis frame, fuel tank (Vintage Candy Red)
      ctx.fillStyle = "#b91c1c"; // Red fuel tank
      ctx.fillRect(36, 12, 30, 11);
      // Rounded edges for gas tank
      ctx.fillRect(34, 14, 34, 7);

      ctx.fillStyle = "#111827"; // Dark vinyl seat
      ctx.fillRect(20, 16, 20, 5);

      // 4. Handlebars & Headlamp (facing right)
      ctx.strokeStyle = "#94a3b8"; // Front forks
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 36);
      ctx.lineTo(65, 4);
      ctx.stroke();

      ctx.fillStyle = "#1e293b"; // Black grips
      ctx.fillRect(58, 2, 10, 3);

      // Headlamp shining light
      ctx.fillStyle = "#ca8a04"; // Chrome casing
      ctx.fillRect(68, 5, 8, 6);

      // Glow yellow ray
      const lightPulse = Math.sin(this.animFrame * 0.15) * 5;
      const headlightGlow = ctx.createRadialGradient(76, 8, 2, 76 + 50, 8, 40 + lightPulse);
      headlightGlow.addColorStop(0, "rgba(254, 240, 138, 0.8)");
      headlightGlow.addColorStop(0.5, "rgba(254, 240, 138, 0.25)");
      headlightGlow.addColorStop(1, "rgba(254, 240, 138, 0)");
      ctx.fillStyle = headlightGlow;
      ctx.beginPath();
      ctx.moveTo(76, 8);
      ctx.lineTo(160, -20);
      ctx.lineTo(160, 40);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }


  /**
   * Draw subtle, romantic falling petals
   */
  public drawPetals(mapWidth: number, mapHeight: number) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    this.ctx.fillStyle = ROMANTIC_COLORS.pastelPink;
    const numPetals = 40;
    for (let i = 0; i < numPetals; i++) {
        const x = (i * 100 + this.animFrame * 0.5) % mapWidth;
        const y = (i * 50 + this.animFrame * 0.2) % mapHeight;
        this.ctx.fillRect(x, y, 2, 2);
    }
  }

  /**
   * Draw beautiful, detailed retro-style barrier gates that block chapter transitions
   */
  public drawBarrier(
    areaId: AreaId,
    isClosed: boolean,
    camera: { x: number; y: number }
  ) {
    const { ctx } = this;
    
    // Choose coordinates of barriers based on the Area
    let bx = 0;
    let by = 0;
    let bHeight = 80;
    let label = "";

    if (areaId === 1) {
      bx = 840;
      by = 290;
      bHeight = 80;
      label = "BRIARS GATE";
    } else if (areaId === 2) {
      bx = 1040;
      by = 230;
      bHeight = 80;
      label = "ROUTE 2";
    } else if (areaId === 3) {
      bx = 1140;
      by = 260;
      bHeight = 140;
      label = "TOLL GATE";
    } else {
      return; // No barriers drawn for other areas
    }

    ctx.save();
    ctx.scale(this.zoomScale, this.zoomScale);
    ctx.translate(bx - camera.x, by - camera.y);

    // 1. Draw Support Posts (Sturdy dark wood pillars)
    ctx.fillStyle = "#1e1b4b"; // Post shadow
    ctx.fillRect(-2, -4, 8, bHeight + 8);
    ctx.fillStyle = "#451a03"; // Brown posts
    ctx.fillRect(-4, -6, 6, 12); // Top post
    ctx.fillRect(-4, bHeight - 6, 6, 12); // Bottom post

    // Draw concrete base footers
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(-6, -2, 10, 4);
    ctx.fillRect(-6, bHeight - 2, 10, 4);

    // 2. Draw Barrier Bar
    ctx.save();
    if (isClosed) {
      // CLOSED BAR: horizontal striped gate bar
      // Draw shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(-4, 24, 16, bHeight - 48);

      // Main yellow-and-black stripe beam
      ctx.fillStyle = "#eab308"; // Solid yellow beam
      ctx.fillRect(-2, 10, 4, bHeight - 20);

      // Draw black safety diagonal stripes
      ctx.fillStyle = "#0f172a";
      for (let sy = 16; sy < bHeight - 20; sy += 16) {
        ctx.beginPath();
        ctx.moveTo(-2, sy);
        ctx.lineTo(2, sy + 6);
        ctx.lineTo(2, sy + 10);
        ctx.lineTo(-2, sy + 4);
        ctx.closePath();
        ctx.fill();
      }

      // 3. Pulsing Yellow Warning Lantern (Hanging on the closed barrier)
      const pulse = Math.sin(this.animFrame * 0.15) > 0;
      const midY = bHeight / 2;

      // Lantern body
      ctx.fillStyle = "#7f1d1d"; // Red metal frame
      ctx.fillRect(-4, midY - 6, 8, 12);
      ctx.fillStyle = "#1e293b"; // Cap
      ctx.fillRect(-5, midY - 8, 10, 2);

      // Pulsing bulb
      if (pulse) {
        // Glowing halo effect
        const glowRad = 15 + Math.sin(this.animFrame * 0.2) * 5;
        const radialGlow = ctx.createRadialGradient(0, midY, 2, 0, midY, glowRad);
        radialGlow.addColorStop(0, "rgba(245, 158, 11, 0.9)");
        radialGlow.addColorStop(0.4, "rgba(245, 158, 11, 0.4)");
        radialGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(0, midY, glowRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fef08a"; // Bright bulb center
        ctx.beginPath();
        ctx.arc(0, midY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#b45309"; // Off state bulb
        ctx.beginPath();
        ctx.arc(0, midY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Miniature warning text placard
      ctx.fillStyle = "#7f1d1d";
      ctx.fillRect(3, midY - 14, 1, 8);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(4, midY - 14, 16, 8);
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 5px monospace";
      ctx.fillText("HALT", 6, midY - 8);

    } else {
      // OPEN BAR: Rotated upwards out of the way!
      ctx.translate(-2, 10);
      ctx.rotate(-Math.PI / 2.3); // Rotate up 70 degrees!

      // Main beam
      ctx.fillStyle = "#10b981"; // Green open beam
      ctx.fillRect(0, 0, 4, bHeight - 20);

      // Light stripes
      ctx.fillStyle = "#ecfdf5";
      for (let sy = 8; sy < bHeight - 20; sy += 16) {
        ctx.fillRect(0, sy, 4, 6);
      }

      // Small green light lantern to show passage is clear
      const midY = (bHeight - 20) / 2;
      ctx.fillStyle = "#064e3b";
      ctx.fillRect(-2, midY - 4, 8, 8);
      
      const greenGlow = ctx.createRadialGradient(2, midY, 1, 2, midY, 10);
      greenGlow.addColorStop(0, "rgba(52, 211, 153, 0.8)");
      greenGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx.fillStyle = greenGlow;
      ctx.beginPath();
      ctx.arc(2, midY, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  /**
   * Draw glowing warm particles drifting across the screen (Sunset vibe)
   */
  public drawSunsetParticles(particles: { x: number; y: number; s: number; a: number }[]) {
    const { ctx } = this;
    ctx.save();

    particles.forEach((p) => {
      ctx.fillStyle = `rgba(251, 146, 60, ${p.a})`;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    });

    ctx.restore();
  }
}
export default GameRenderer;
