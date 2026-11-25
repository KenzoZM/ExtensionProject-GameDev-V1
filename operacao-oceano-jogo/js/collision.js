// Funções reutilizáveis de hitbox e colisão.
// Convenção: entidades usam (x, y) como CENTRO e hitboxRadius para colisão circular.

/** Círculo-círculo: usado para coleta de resíduos, bolhas e resgate da tartaruga. */
export function circlesOverlap(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radii = a.hitboxRadius + b.hitboxRadius;
  // Compara distâncias ao quadrado para evitar Math.sqrt a cada teste.
  return dx * dx + dy * dy <= radii * radii;
}

/** Círculo-retângulo: usado entre o mergulhador (círculo) e a água-viva (retângulo). */
export function circleRectOverlap(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.hitboxRadius * circle.hitboxRadius;
}

export function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Mantém um valor entre min e max. */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
