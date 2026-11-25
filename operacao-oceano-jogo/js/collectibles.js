// Resíduos, bolhas de oxigênio e tartaruga: criação e atualização.
// As regras de pontuação ficam em game.js, para não duplicar lógica.
import { TRASH_TYPES, TRASH_COUNT, BUBBLE, TURTLE, PLAYER, WORLD_BOUNDS } from "./config.js";
import { findFreePosition, randomBetween } from "./spawn.js";

const TRASH_TYPE_NAMES = Object.keys(TRASH_TYPES);
const TURTLE_RESCUE_ANIMATION_SECONDS = 2;

// ---------- Resíduos ----------

export function createTrashItems() {
  const items = [];
  // Pontos a evitar: início do jogador e a tartaruga.
  const avoid = [
    { x: PLAYER.startX, y: PLAYER.startY, minDistance: 110 },
    { x: TURTLE.x, y: TURTLE.y, minDistance: 90 },
  ];

  for (let i = 0; i < TRASH_COUNT; i++) {
    const type = TRASH_TYPE_NAMES[i % TRASH_TYPE_NAMES.length]; // 5 de cada tipo
    const spec = TRASH_TYPES[type];
    const position = findFreePosition(40, avoid);
    items.push({
      type,
      x: position.x,
      y: position.y,
      width: spec.width,
      height: spec.height,
      hitboxRadius: spec.hitboxRadius,
      points: spec.points,
      rotation: randomBetween(-0.6, 0.6),
      bobPhase: randomBetween(0, Math.PI * 2),
    });
    avoid.push({ x: position.x, y: position.y, minDistance: 70 });
  }
  return items;
}

export function updateTrashItems(items, deltaTime) {
  for (const item of items) {
    item.bobPhase += deltaTime * 1.5;
  }
}

// ---------- Bolhas de oxigênio ----------

export function createBubble(avoidPoints) {
  const position = findFreePosition(50, avoidPoints);
  return {
    x: position.x,
    y: position.y,
    size: BUBBLE.size,
    hitboxRadius: BUBBLE.hitboxRadius,
    age: 0,
    lifetime: BUBBLE.lifetime,
    phase: randomBetween(0, Math.PI * 2),
  };
}

export function createInitialBubbles(player, enabled = true) {
  const bubbles = [];
  if (!enabled) return bubbles; // fase sem bolhas de oxigênio
  const avoid = [{ x: player.x, y: player.y, minDistance: 150 }];
  for (let i = 0; i < BUBBLE.initialCount; i++) {
    const bubble = createBubble(avoid);
    bubbles.push(bubble);
    avoid.push({ x: bubble.x, y: bubble.y, minDistance: 160 });
  }
  return bubbles;
}

/** Envelhece as bolhas e remove as expiradas (iteração de trás para frente). */
export function updateBubbles(bubbles, deltaTime) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const bubble = bubbles[i];
    bubble.age += deltaTime;
    bubble.phase += deltaTime * 2;
    if (bubble.age >= bubble.lifetime) {
      bubbles.splice(i, 1);
    }
  }
}

// ---------- Tartaruga ----------

/** speed = 0: tartaruga parada (fase 1); speed > 0: nada pelo cenário. */
export function createTurtle(speed = 0) {
  const turtle = {
    x: TURTLE.x,
    y: TURTLE.y,
    baseY: TURTLE.y,
    width: TURTLE.width,
    height: TURTLE.height,
    hitboxRadius: TURTLE.hitboxRadius,
    rescued: false,
    visible: true,
    alpha: 1,
    floatTime: 0,
    rescueTimer: 0,
    speed,
    dirX: 0,
    dirY: 0,
    turnTimer: 0,
  };
  if (speed > 0) pickTurtleDirection(turtle);
  return turtle;
}

function pickTurtleDirection(turtle) {
  const angle = randomBetween(0, Math.PI * 2);
  turtle.dirX = Math.cos(angle);
  turtle.dirY = Math.sin(angle) * 0.5; // nado mais horizontal
  turtle.turnTimer = randomBetween(TURTLE.swimTurnMin, TURTLE.swimTurnMax);
}

/** Movimento autônomo da tartaruga, rebatendo nas bordas (mesma ideia das águas-vivas). */
function swimTurtle(turtle, deltaTime) {
  turtle.turnTimer -= deltaTime;
  if (turtle.turnTimer <= 0) pickTurtleDirection(turtle);

  turtle.x += turtle.dirX * turtle.speed * deltaTime;
  turtle.baseY += turtle.dirY * turtle.speed * deltaTime;

  const halfW = turtle.width / 2;
  const halfH = turtle.height / 2 + 6; // margem da flutuação
  if (turtle.x < WORLD_BOUNDS.left + halfW) {
    turtle.x = WORLD_BOUNDS.left + halfW;
    turtle.dirX = Math.abs(turtle.dirX);
  } else if (turtle.x > WORLD_BOUNDS.right - halfW) {
    turtle.x = WORLD_BOUNDS.right - halfW;
    turtle.dirX = -Math.abs(turtle.dirX);
  }
  if (turtle.baseY < WORLD_BOUNDS.top + halfH) {
    turtle.baseY = WORLD_BOUNDS.top + halfH;
    turtle.dirY = Math.abs(turtle.dirY);
  } else if (turtle.baseY > WORLD_BOUNDS.bottom - halfH) {
    turtle.baseY = WORLD_BOUNDS.bottom - halfH;
    turtle.dirY = -Math.abs(turtle.dirY);
  }
}

export function updateTurtle(turtle, deltaTime) {
  turtle.floatTime += deltaTime;
  if (!turtle.rescued) {
    if (turtle.speed > 0) swimTurtle(turtle, deltaTime);
    // Flutuação sutil por cima do deslocamento.
    turtle.y = turtle.baseY + Math.sin(turtle.floatTime * 1.6) * 6;
    return;
  }
  if (!turtle.visible) {
    return;
  }
  // Após o resgate, a tartaruga nada para cima e desaparece.
  turtle.rescueTimer += deltaTime;
  turtle.x += 60 * deltaTime;
  turtle.y -= 90 * deltaTime;
  turtle.alpha = Math.max(0, 1 - turtle.rescueTimer / TURTLE_RESCUE_ANIMATION_SECONDS);
  if (turtle.rescueTimer >= TURTLE_RESCUE_ANIMATION_SECONDS) {
    turtle.visible = false;
  }
}
