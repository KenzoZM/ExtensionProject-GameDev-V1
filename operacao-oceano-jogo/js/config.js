// Constantes centrais de tela e balanceamento (fonte: operacao-oceano-claude-context/docs/02-GAME-DESIGN.md).

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// Faixa jogável: abaixo da superfície e acima do fundo de areia.
export const WORLD_BOUNDS = { left: 0, top: 40, right: CANVAS_WIDTH, bottom: CANVAS_HEIGHT - 30 };

export const MAX_DELTA_TIME = 0.05;
export const DEBUG_HITBOXES = false;

export const PLAYER = {
  // Sprite 84×52 (proporção do quadro 128×80); hitbox circular de ~36 px de diâmetro.
  width: 84,
  height: 52,
  hitboxRadius: 18,
  speed: 220,
  startX: 120,
  startY: 270,
};

export const START_LIVES = 3;
export const INVULNERABILITY_SECONDS = 1.3;

export const TRASH_COUNT = 15;
export const TRASH_TYPES = {
  bottle: { points: 10, width: 22, height: 40, hitboxRadius: 16, label: "Garrafa" },
  bag: { points: 15, width: 34, height: 38, hitboxRadius: 17, label: "Sacola" },
  can: { points: 20, width: 22, height: 32, hitboxRadius: 14, label: "Lata" },
};

export const BUBBLE = {
  size: 36,
  hitboxRadius: 18,
  initialCount: 3,
  maxActive: 3,
  spawnInterval: 15,
  lifetime: 10,
};

export const TURTLE = {
  width: 84,
  height: 56,
  hitboxRadius: 26,
  x: 820,
  y: 300,
  rescuePoints: 100,
  // Usado nas fases em que a tartaruga nada pelo cenário.
  swimTurnMin: 2.5,
  swimTurnMax: 4.5,
};

// Marcos de dificuldade padrão (tempo da fase): cada um ocorre uma única vez.
const STANDARD_DIFFICULTY = [
  { atSeconds: 30, speedMultiplier: 1.15, addEnemies: 1 },
  { atSeconds: 60, speedMultiplier: 1.3, addEnemies: 1 },
];

// Fases. Cada uma define: meta de resíduos, oxigênio (inicial e máximo), segundos
// devolvidos por bolha (0 = fase sem bolhas), águas-vivas iniciais e máximas, marcos de
// dificuldade, velocidade da tartaruga (0 = parada) e se há água-viva mãe (gigante).
// O resgate da tartaruga é obrigatório em todas as fases.
export const LEVELS = [
  {
    number: 1, trashGoal: 12, oxygenSeconds: 60, bubbleOxygen: 12, jellyfishCount: 3, jellyfishMax: 5,
    difficultySteps: STANDARD_DIFFICULTY, turtleSpeed: 0, intro: "Fase 1: limpe o recife!",
  },
  {
    number: 2, trashGoal: 12, oxygenSeconds: 40, bubbleOxygen: 12, jellyfishCount: 4, jellyfishMax: 5,
    difficultySteps: STANDARD_DIFFICULTY, turtleSpeed: 55, intro: "Fase 2: a tartaruga está nadando!",
  },
  {
    // Fase 3: dificuldade sobe na metade do oxigênio (15 s); bolhas valem metade.
    number: 3, trashGoal: 12, oxygenSeconds: 30, bubbleOxygen: 6, jellyfishCount: 6, jellyfishMax: 7,
    difficultySteps: [{ atSeconds: 15, speedMultiplier: 1.15, addEnemies: 1 }],
    turtleSpeed: 90, intro: "Fase 3: pouco oxigênio e muitas águas-vivas!",
  },
  {
    // Fase 4: mesmo oxigênio e águas-vivas da fase 3, sem bolhas, todos os 15 resíduos
    // e a água-viva mãe (gigante), que derrota o jogador com um único toque.
    number: 4, trashGoal: 15, oxygenSeconds: 30, bubbleOxygen: 0, jellyfishCount: 6, jellyfishMax: 7,
    difficultySteps: [{ atSeconds: 15, speedMultiplier: 1.15, addEnemies: 1 }],
    turtleSpeed: 90, giantJellyfish: true, intro: "Fase 4: cuidado com a água-viva mãe!",
  },
];

export const MISSION_BONUS = 150;

export const JELLYFISH = {
  width: 44,
  height: 56,
  hitboxRadius: 16,
  baseSpeed: 70,
  // Distância mínima do jogador ao criar uma água-viva (evita dano injusto).
  safeSpawnDistance: 200,
};

// Água-viva mãe (gigante), presente apenas nas fases com giantJellyfish: true.
// Encostar nela tira todas as vidas de uma vez (ignora a invulnerabilidade).
export const GIANT_JELLYFISH = {
  scale: 2.5, // tamanho em relação à água-viva comum
  speedFactor: 2, // 2× mais rápida que a água-viva comum
  safeSpawnDistance: 380,
};


export const FLOATING_TEXT_SECONDS = 0.9;
