// Renderização no Canvas 2D: cenário, sprites (drawImage), efeitos e hitboxes de depuração.
import { CANVAS_WIDTH, CANVAS_HEIGHT, DEBUG_HITBOXES, WORLD_BOUNDS } from "./config.js";
import { DIVER_FRAME } from "./assets.js";
import { isInvulnerable } from "./player.js";

const SAND_TOP = CANVAS_HEIGHT - 42;

// Bolhinhas decorativas de fundo: posições fixas, movimento calculado a partir do tempo.
const AMBIENT_BUBBLES = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 137) % CANVAS_WIDTH,
  offset: (i * 89) % CANVAS_HEIGHT,
  speed: 18 + (i % 5) * 7,
  radius: 1.5 + (i % 3),
}));

const SEAWEED = [
  { x: 40, height: 120, color: "#2f9e5b" }, { x: 62, height: 90, color: "#3fbf6e" },
  { x: 300, height: 80, color: "#2f9e5b" }, { x: 520, height: 110, color: "#3fbf6e" },
  { x: 545, height: 70, color: "#2f9e5b" }, { x: 905, height: 130, color: "#3fbf6e" },
  { x: 930, height: 95, color: "#2f9e5b" },
];

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    // Sprites são vetoriais (SVG): suavização ligada mantém as bordas limpas ao escalar.
    this.ctx.imageSmoothingEnabled = true;
    this.images = {};
    // O cenário estático é desenhado uma única vez em um canvas auxiliar.
    this.background = this.createBackground();
  }

  setImages(images) {
    this.images = images;
  }

  // ---------- Cenário ----------

  createBackground() {
    const layer = document.createElement("canvas");
    layer.width = CANVAS_WIDTH;
    layer.height = CANVAS_HEIGHT;
    const ctx = layer.getContext("2d");

    // Água: gradiente do azul claro (superfície) ao azul-marinho (fundo).
    const water = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    water.addColorStop(0, "#1a7fc4");
    water.addColorStop(0.35, "#0b4f8f");
    water.addColorStop(1, "#04193d");
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Raios de luz vindos da superfície.
    ctx.fillStyle = "rgba(170, 230, 255, 0.07)";
    const rays = [[300, 80], [430, 60], [560, 90], [700, 50]];
    for (const [x, width] of rays) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + width, 0);
      ctx.lineTo(x + width * 2.4 - 60, CANVAS_HEIGHT);
      ctx.lineTo(x - 120, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();
    }

    // Silhuetas de rochas distantes.
    ctx.fillStyle = "#0a2f5e";
    this.drawRockRow(ctx, SAND_TOP - 40, 70, 13);
    ctx.fillStyle = "#082650";
    this.drawRockRow(ctx, SAND_TOP - 10, 50, 29);

    // Areia.
    const sand = ctx.createLinearGradient(0, SAND_TOP, 0, CANVAS_HEIGHT);
    sand.addColorStop(0, "#8c7a52");
    sand.addColorStop(1, "#5b4c30");
    ctx.fillStyle = sand;
    ctx.beginPath();
    ctx.moveTo(0, SAND_TOP + 8);
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
      ctx.lineTo(x, SAND_TOP + 6 + Math.sin(x * 0.03) * 5);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Rochas próximas nos cantos.
    ctx.fillStyle = "#33406b";
    this.drawRock(ctx, 0, CANVAS_HEIGHT, 150, 80);
    this.drawRock(ctx, 820, CANVAS_HEIGHT, 160, 95);
    this.drawRock(ctx, 400, CANVAS_HEIGHT, 90, 34);

    // Corais e esponjas.
    this.drawBranchCoral(ctx, 120, SAND_TOP + 14, 52, "#ff6f91");
    this.drawBranchCoral(ctx, 690, SAND_TOP + 16, 44, "#ff9f43");
    this.drawBranchCoral(ctx, 240, SAND_TOP + 18, 34, "#f25f7a");
    this.drawTubeSponge(ctx, 780, SAND_TOP + 16, "#e58a2e");
    this.drawTubeSponge(ctx, 360, SAND_TOP + 20, "#7b5cd6");

    // Estrela-do-mar.
    this.drawStar(ctx, 600, SAND_TOP + 24, 10, "#ff8c42");

    return layer;
  }

  drawRockRow(ctx, baseY, height, seed) {
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    for (let x = 0; x <= CANVAS_WIDTH; x += 30) {
      const bump = Math.abs(Math.sin((x + seed * 17) * 0.011) * Math.cos((x + seed) * 0.023));
      ctx.lineTo(x, baseY - bump * height);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  drawRock(ctx, x, bottom, width, height) {
    ctx.beginPath();
    ctx.ellipse(x + width / 2, bottom, width / 2, height, 0, Math.PI, 0);
    ctx.fill();
  }

  drawBranchCoral(ctx, x, baseY, size, color) {
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    const branch = (bx, by, length, angle, depth) => {
      const ex = bx + Math.cos(angle) * length;
      const ey = by + Math.sin(angle) * length;
      ctx.lineWidth = Math.max(2, depth * 2.2);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      if (depth > 1) {
        branch(ex, ey, length * 0.7, angle - 0.45, depth - 1);
        branch(ex, ey, length * 0.7, angle + 0.45, depth - 1);
      }
    };
    branch(x, baseY, size * 0.5, -Math.PI / 2, 4);
  }

  drawTubeSponge(ctx, x, baseY, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 2;
    const tubes = [[-14, 34], [0, 48], [14, 28]];
    for (const [offset, height] of tubes) {
      ctx.beginPath();
      ctx.roundRect(x + offset - 6, baseY - height, 12, height, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.ellipse(x + offset, baseY - height + 2, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
    }
  }

  drawStar(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawAmbient(time) {
    const ctx = this.ctx;

    // Algas balançando (animação procedural com seno).
    ctx.lineCap = "round";
    for (const weed of SEAWEED) {
      ctx.strokeStyle = weed.color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(weed.x, CANVAS_HEIGHT - 6);
      for (let step = 1; step <= 6; step++) {
        const progress = step / 6;
        const sway = Math.sin(time * 1.4 + weed.x * 0.05 + progress * 2) * 10 * progress;
        ctx.lineTo(weed.x + sway, CANVAS_HEIGHT - 6 - weed.height * progress);
      }
      ctx.stroke();
    }

    // Bolhinhas subindo.
    ctx.fillStyle = "rgba(200, 240, 255, 0.35)";
    for (const bubble of AMBIENT_BUBBLES) {
      const travel = (bubble.offset + time * bubble.speed) % CANVAS_HEIGHT;
      const y = CANVAS_HEIGHT - travel;
      const x = bubble.x + Math.sin(time + bubble.offset) * 6;
      ctx.beginPath();
      ctx.arc(x, y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Brilho ondulante da superfície.
    ctx.fillStyle = "rgba(190, 240, 255, 0.18)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= CANVAS_WIDTH; x += 24) {
      ctx.lineTo(x, 14 + Math.sin(x * 0.04 + time * 2) * 5);
    }
    ctx.lineTo(CANVAS_WIDTH, 0);
    ctx.closePath();
    ctx.fill();
  }

  // ---------- Desenho principal ----------

  draw(game) {
    const ctx = this.ctx;
    ctx.drawImage(this.background, 0, 0);
    this.drawAmbient(game.ambientTime);

    if (!game.isMatchVisible()) {
      return; // menus: apenas o cenário animado ao fundo
    }

    for (const item of game.trashItems) this.drawTrash(item);
    for (const bubble of game.oxygenBubbles) this.drawBubble(bubble);
    this.drawTurtle(game.turtle);
    for (const jelly of game.enemies) this.drawJellyfish(jelly);
    if (game.giantJellyfish) this.drawGiantJellyfish(game.giantJellyfish);
    this.drawPlayer(game.player);
    this.drawEffects(game.effects);

    if (DEBUG_HITBOXES) this.drawHitboxes(game);

    if (game.damageFlashTimer > 0) {
      ctx.fillStyle = `rgba(255, 40, 70, ${game.damageFlashTimer * 0.6})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    // Avisos só durante o jogo ativo (não ficam congelados atrás das telas de resultado).
    if (game.announcement.timer > 0 && game.state === "playing") {
      this.drawAnnouncement(game.announcement);
    }
    if (game.trashCollected >= game.trashGoal && !game.turtleRescued) {
      this.drawHint("Meta de resíduos cumprida! Resgate a tartaruga.");
    }
  }

  /** Desenha uma imagem centrada em (x, y) com rotação/escala opcionais. */
  drawSprite(image, x, y, width, height, rotation = 0, alpha = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  drawFallbackCircle(x, y, radius, color) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTrash(item) {
    const image = this.images[item.type];
    const y = item.y + Math.sin(item.bobPhase) * 3;
    const rotation = item.rotation + Math.sin(item.bobPhase * 0.7) * 0.12;
    if (image) {
      this.drawSprite(image, item.x, y, item.width, item.height, rotation);
    } else {
      this.drawFallbackCircle(item.x, y, item.hitboxRadius, "#d0d6dd");
    }
  }

  drawBubble(bubble) {
    const remaining = bubble.lifetime - bubble.age;
    // Pisca nos últimos 2,5 s para avisar que vai sumir.
    let alpha = 1;
    if (remaining < 2.5) {
      alpha = Math.sin(remaining * 18) > 0 ? 0.9 : 0.35;
    }
    const scale = 1 + Math.sin(bubble.phase) * 0.06;
    const size = bubble.size * scale;
    const y = bubble.y + Math.sin(bubble.phase * 0.8) * 4;
    if (this.images.bubble) {
      this.drawSprite(this.images.bubble, bubble.x, y, size, size, 0, alpha);
    } else {
      this.drawFallbackCircle(bubble.x, y, size / 2, "rgba(95, 244, 255, 0.6)");
    }
  }

  drawTurtle(turtle) {
    if (!turtle.visible) return;
    if (this.images.turtle) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = turtle.alpha;
      ctx.translate(turtle.x, turtle.y);
      ctx.rotate(Math.sin(turtle.floatTime * 1.6) * 0.05);
      // O sprite olha para a esquerda: espelha ao nadar para a direita ou ao ir embora.
      if (turtle.rescued || turtle.dirX > 0) ctx.scale(-1, 1);
      ctx.drawImage(this.images.turtle, -turtle.width / 2, -turtle.height / 2, turtle.width, turtle.height);
      ctx.restore();
    } else {
      this.drawFallbackCircle(turtle.x, turtle.y, turtle.hitboxRadius, "#5dbb4a");
    }
    if (!turtle.rescued) {
      this.drawLabel("Socorro!", turtle.x, turtle.y - turtle.height / 2 - 8, "#ffffff");
    }
  }

  drawJellyfish(jelly) {
    // "Pulsação": estica e achata levemente o sprite com o tempo.
    const pulse = Math.sin(jelly.pulseTime);
    const width = jelly.width * (1 + pulse * 0.06);
    const height = jelly.height * (1 - pulse * 0.06);
    if (this.images.jellyfish) {
      this.drawSprite(this.images.jellyfish, jelly.x, jelly.y, width, height, jelly.dirX * 0.12, 0.95);
    } else {
      this.drawFallbackCircle(jelly.x, jelly.y, jelly.width / 2, "#9b4fe0");
    }
  }

  /** Água-viva mãe: brilho vermelho pulsante atrás do sprite ampliado, para indicar perigo. */
  drawGiantJellyfish(giant) {
    const ctx = this.ctx;
    const glowRadius = giant.width * (0.75 + Math.sin(giant.pulseTime) * 0.05);
    const glow = ctx.createRadialGradient(giant.x, giant.y, giant.width * 0.15, giant.x, giant.y, glowRadius);
    glow.addColorStop(0, "rgba(255, 60, 90, 0.45)");
    glow.addColorStop(1, "rgba(255, 60, 90, 0)");
    ctx.save();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(giant.x, giant.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.drawJellyfish(giant);
  }

  drawPlayer(player) {
    // Piscar durante a invulnerabilidade.
    if (isInvulnerable(player) && Math.floor(player.invulnerabilityTimer * 12) % 2 === 0) {
      return;
    }
    const ctx = this.ctx;
    const image = this.images.diver;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.facing, 1); // espelha ao nadar para a esquerda
    ctx.rotate(player.tilt);
    if (image) {
      // Recorte do quadro atual no sprite sheet: drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh).
      ctx.drawImage(
        image,
        player.frame * DIVER_FRAME.width, 0, DIVER_FRAME.width, DIVER_FRAME.height,
        -player.width / 2, -player.height / 2, player.width, player.height,
      );
    } else {
      ctx.fillStyle = "#f2b705";
      ctx.fillRect(-player.width / 2, -player.height / 4, player.width, player.height / 2);
    }
    ctx.restore();
  }

  drawEffects(effects) {
    const ctx = this.ctx;
    for (const effect of effects) {
      const progress = effect.age / effect.duration;
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      if (effect.kind === "ring") {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 12 + progress * 30, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        this.drawLabel(effect.text, effect.x, effect.y, effect.color, 20);
      }
      ctx.restore();
    }
  }

  drawLabel(text, x, y, color, size = 14) {
    const ctx = this.ctx;
    ctx.font = `bold ${size}px "Trebuchet MS", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(2, 12, 30, 0.85)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  drawAnnouncement(announcement) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = Math.min(1, announcement.timer);
    ctx.fillStyle = "rgba(4, 20, 48, 0.75)";
    ctx.beginPath();
    ctx.roundRect(CANVAS_WIDTH / 2 - 230, 96, 460, 44, 10);
    ctx.fill();
    this.drawLabel(announcement.text, CANVAS_WIDTH / 2, 118, "#ffb86b", 20);
    ctx.restore();
  }

  drawHint(text) {
    this.drawLabel(text, CANVAS_WIDTH / 2, WORLD_BOUNDS.bottom - 4, "#8dff7a", 18);
  }

  drawHitboxes(game) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#00ff88";
    const circle = (entity) => {
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, entity.hitboxRadius, 0, Math.PI * 2);
      ctx.stroke();
    };
    circle(game.player);
    game.trashItems.forEach(circle);
    game.oxygenBubbles.forEach(circle);
    if (!game.turtle.rescued) circle(game.turtle);
    ctx.strokeStyle = "#ff3366";
    const allJellies = game.giantJellyfish ? [...game.enemies, game.giantJellyfish] : game.enemies;
    for (const jelly of allJellies) {
      ctx.strokeRect(jelly.hitbox.x, jelly.hitbox.y, jelly.hitbox.width, jelly.hitbox.height);
    }
    ctx.restore();
  }
}
