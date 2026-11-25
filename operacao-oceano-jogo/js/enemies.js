// Águas-vivas: criação, movimento autônomo e progressão da dificuldade.
import { JELLYFISH, GIANT_JELLYFISH, WORLD_BOUNDS } from "./config.js";
import { findFreePosition, randomBetween } from "./spawn.js";

function pickDirection(jelly) {
  const angle = randomBetween(0, Math.PI * 2);
  jelly.dirX = Math.cos(angle);
  jelly.dirY = Math.sin(angle) * 0.6; // movimento mais horizontal que vertical
  jelly.turnTimer = randomBetween(2, 4);
}

function updateHitbox(jelly) {
  jelly.hitbox.x = jelly.x - jelly.hitbox.width / 2;
  jelly.hitbox.y = jelly.y - jelly.height / 2 + 2;
}

/** scale > 1 cria uma água-viva maior (usada pela água-viva mãe). */
export function createJellyfish(player, scale = 1, safeDistance = JELLYFISH.safeSpawnDistance) {
  const width = JELLYFISH.width * scale;
  const height = JELLYFISH.height * scale;
  // Nunca nasce em cima do jogador.
  const position = findFreePosition(Math.max(60, height / 2 + 10), [
    { x: player.x, y: player.y, minDistance: safeDistance },
  ]);
  const jelly = {
    x: position.x,
    y: position.y,
    width,
    height,
    dirX: 0,
    dirY: 0,
    turnTimer: 0,
    swayPhase: randomBetween(0, Math.PI * 2),
    pulseTime: randomBetween(0, Math.PI * 2),
    // Hitbox retangular menor que o sprite: cobre a "cabeça", não as pontas dos tentáculos.
    hitbox: { x: 0, y: 0, width: width * 0.72, height: height * 0.6 },
  };
  pickDirection(jelly);
  updateHitbox(jelly);
  return jelly;
}

/** Água-viva mãe: gigante e 2× mais rápida (ver GIANT_JELLYFISH em config.js). */
export function createGiantJellyfish(player) {
  const giant = createJellyfish(player, GIANT_JELLYFISH.scale, GIANT_JELLYFISH.safeSpawnDistance);
  giant.isGiant = true;
  return giant;
}

export function createInitialEnemies(player, count) {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push(createJellyfish(player));
  }
  return enemies;
}

export function updateEnemies(enemies, deltaTime, speedMultiplier) {
  const speed = JELLYFISH.baseSpeed * speedMultiplier;
  for (const jelly of enemies) {
    const halfW = jelly.width / 2;
    const halfH = jelly.height / 2;
    // Muda de direção de tempos em tempos (contador atualizado pelo game loop).
    jelly.turnTimer -= deltaTime;
    if (jelly.turnTimer <= 0) {
      pickDirection(jelly);
    }

    // Deslocamento + flutuação senoidal vertical.
    jelly.swayPhase += deltaTime * 2.2;
    jelly.pulseTime += deltaTime * 4;
    jelly.x += jelly.dirX * speed * deltaTime;
    jelly.y += (jelly.dirY * speed + Math.sin(jelly.swayPhase) * 30) * deltaTime;

    // Mantém dentro do cenário, rebatendo nas bordas.
    if (jelly.x < WORLD_BOUNDS.left + halfW) {
      jelly.x = WORLD_BOUNDS.left + halfW;
      jelly.dirX = Math.abs(jelly.dirX);
    } else if (jelly.x > WORLD_BOUNDS.right - halfW) {
      jelly.x = WORLD_BOUNDS.right - halfW;
      jelly.dirX = -Math.abs(jelly.dirX);
    }
    if (jelly.y < WORLD_BOUNDS.top + halfH) {
      jelly.y = WORLD_BOUNDS.top + halfH;
      jelly.dirY = Math.abs(jelly.dirY);
    } else if (jelly.y > WORLD_BOUNDS.bottom - halfH) {
      jelly.y = WORLD_BOUNDS.bottom - halfH;
      jelly.dirY = -Math.abs(jelly.dirY);
    }

    updateHitbox(jelly);
  }
}

/** steps e maxEnemies vêm da fase atual (LEVELS em config.js). */
export function createDifficulty(steps, maxEnemies) {
  return { steps, maxEnemies, nextStepIndex: 0, speedMultiplier: 1, level: 1 };
}

/**
 * Aplica os marcos de dificuldade da fase. Cada marco ocorre uma única vez,
 * e nunca há mais águas-vivas que o máximo da fase.
 * Retorna true quando um novo marco foi aplicado.
 */
export function updateDifficulty(difficulty, elapsedSeconds, enemies, player) {
  const step = difficulty.steps[difficulty.nextStepIndex];
  if (!step || elapsedSeconds < step.atSeconds) {
    return false;
  }
  difficulty.nextStepIndex++;
  difficulty.level++;
  difficulty.speedMultiplier = step.speedMultiplier;
  for (let i = 0; i < step.addEnemies && enemies.length < difficulty.maxEnemies; i++) {
    enemies.push(createJellyfish(player));
  }
  return true;
}
