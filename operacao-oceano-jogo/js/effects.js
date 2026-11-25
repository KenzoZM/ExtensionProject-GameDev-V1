// Efeitos temporários de feedback (textos flutuantes e anéis de coleta).
// São atualizados pelo game loop e removidos quando expiram.
import { FLOATING_TEXT_SECONDS } from "./config.js";

export function addFloatingText(effects, text, x, y, color) {
  effects.push({ kind: "text", text, x, y, color, age: 0, duration: FLOATING_TEXT_SECONDS });
}

export function addRing(effects, x, y, color) {
  effects.push({ kind: "ring", x, y, color, age: 0, duration: 0.45 });
}

export function updateEffects(effects, deltaTime) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    effect.age += deltaTime;
    if (effect.kind === "text") {
      effect.y -= 40 * deltaTime; // texto sobe enquanto desaparece
    }
    if (effect.age >= effect.duration) {
      effects.splice(i, 1);
    }
  }
}
