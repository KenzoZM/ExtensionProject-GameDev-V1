// Mergulhador: estado, movimentação, limites e invulnerabilidade.
import { PLAYER, WORLD_BOUNDS, INVULNERABILITY_SECONDS } from "./config.js";
import { clamp } from "./collision.js";

const SWIM_FRAME_SECONDS = 0.18;
const IDLE_FRAME_SECONDS = 0.45;

export function createPlayer() {
  return {
    x: PLAYER.startX,
    y: PLAYER.startY,
    width: PLAYER.width,
    height: PLAYER.height,
    hitboxRadius: PLAYER.hitboxRadius,
    speed: PLAYER.speed,
    facing: 1, // 1 = direita, -1 = esquerda
    tilt: 0,
    isMoving: false,
    frame: 0, // quadro atual do sprite sheet (0 ou 1)
    frameTimer: 0,
    invulnerabilityTimer: 0,
  };
}

export function updatePlayer(player, axis, deltaTime) {
  let dirX = axis.x;
  let dirY = axis.y;

  // Normaliza a diagonal: (1,1) teria comprimento ~1,41 e seria mais rápido.
  const length = Math.hypot(dirX, dirY);
  if (length > 0) {
    dirX /= length;
    dirY /= length;
  }

  // Movimento independente do FPS: velocidade (px/s) × delta time (s).
  player.x += dirX * player.speed * deltaTime;
  player.y += dirY * player.speed * deltaTime;

  // Limites: o centro fica a meia largura/altura das bordas.
  const halfW = player.width / 2;
  const halfH = player.height / 2;
  player.x = clamp(player.x, WORLD_BOUNDS.left + halfW, WORLD_BOUNDS.right - halfW);
  player.y = clamp(player.y, WORLD_BOUNDS.top + halfH, WORLD_BOUNDS.bottom - halfH);

  player.isMoving = length > 0;
  if (dirX !== 0) {
    player.facing = dirX > 0 ? 1 : -1;
  }
  player.tilt = dirY * 0.25;

  // Animação por frames: alterna os quadros mais rápido enquanto nada.
  player.frameTimer += deltaTime;
  const frameDuration = player.isMoving ? SWIM_FRAME_SECONDS : IDLE_FRAME_SECONDS;
  if (player.frameTimer >= frameDuration) {
    player.frameTimer -= frameDuration;
    player.frame = 1 - player.frame;
  }

  if (player.invulnerabilityTimer > 0) {
    player.invulnerabilityTimer = Math.max(0, player.invulnerabilityTimer - deltaTime);
  }
}

export function isInvulnerable(player) {
  return player.invulnerabilityTimer > 0;
}

/** Aplica dano somente se não estiver invulnerável. Retorna true se o dano ocorreu. */
export function tryDamagePlayer(player) {
  if (isInvulnerable(player)) {
    return false;
  }
  player.invulnerabilityTimer = INVULNERABILITY_SECONDS;
  return true;
}
