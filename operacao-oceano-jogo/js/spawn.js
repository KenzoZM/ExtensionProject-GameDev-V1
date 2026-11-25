// Geração de posições aleatórias válidas dentro do cenário.
import { WORLD_BOUNDS } from "./config.js";
import { distanceBetween } from "./collision.js";

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Sorteia uma posição dentro dos limites que respeite distâncias mínimas.
 * @param {number} margin distância mínima das bordas
 * @param {Array<{x:number,y:number,minDistance:number}>} avoid pontos a evitar
 */
export function findFreePosition(margin, avoid, attempts = 80) {
  let candidate = null;
  for (let i = 0; i < attempts; i++) {
    candidate = {
      x: randomBetween(WORLD_BOUNDS.left + margin, WORLD_BOUNDS.right - margin),
      y: randomBetween(WORLD_BOUNDS.top + margin, WORLD_BOUNDS.bottom - margin),
    };
    const isFree = avoid.every((point) => distanceBetween(candidate, point) >= point.minDistance);
    if (isFree) {
      return candidate;
    }
  }
  // Sem espaço ideal: ainda retorna uma posição dentro dos limites (sempre alcançável).
  return candidate;
}
