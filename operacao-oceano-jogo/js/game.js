// Controlador da partida: estado central, transições, reinício e integração dos sistemas.
import {
  START_LIVES, LEVELS, BUBBLE, TURTLE, MISSION_BONUS, GIANT_JELLYFISH,
} from "./config.js";
import { createPlayer, updatePlayer, tryDamagePlayer } from "./player.js";
import {
  createTrashItems, updateTrashItems, createBubble, createInitialBubbles, updateBubbles,
  createTurtle, updateTurtle,
} from "./collectibles.js";
import {
  createInitialEnemies, createGiantJellyfish, updateEnemies, createDifficulty, updateDifficulty,
} from "./enemies.js";
import { circlesOverlap, circleRectOverlap } from "./collision.js";
import { addFloatingText, addRing, updateEffects } from "./effects.js";

export const GameState = Object.freeze({
  MENU: "menu",
  INSTRUCTIONS: "instructions",
  CREDITS: "credits",
  PLAYING: "playing",
  PAUSED: "paused",
  LEVEL_COMPLETE: "levelComplete", // fase concluída, ainda há próxima fase
  VICTORY: "victory", // última fase concluída
  GAME_OVER: "gameOver",
});

// Estados em que existe uma partida para desenhar no Canvas.
const MATCH_STATES = new Set([
  GameState.PLAYING, GameState.PAUSED, GameState.LEVEL_COMPLETE, GameState.VICTORY, GameState.GAME_OVER,
]);

const DAMAGE_FLASH_SECONDS = 0.35;
const ANNOUNCEMENT_SECONDS = 2.5;

export class Game {
  constructor(input) {
    this.input = input;
    this.state = GameState.MENU;
    this.onStateChange = null; // definido em main.js para atualizar a interface HTML
    this.ambientTime = 0; // animações decorativas do cenário
    this.hasMatch = false;
    this.levelIndex = 0;
    this.levelStartScore = 0; // pontuação ao entrar na fase (usada ao reiniciar a fase)
    this.resetGame();

    input.onPauseKey = () => this.togglePause();
  }

  /** Configuração da fase atual (ver LEVELS em config.js). */
  get level() {
    return LEVELS[this.levelIndex];
  }

  get hasBubbles() {
    return this.level.bubbleOxygen > 0;
  }

  get trashGoal() {
    return this.level.trashGoal;
  }

  get isLastLevel() {
    return this.levelIndex === LEVELS.length - 1;
  }

  /**
   * Restaura todos os valores da fase atual e recria entidades. Não registra listeners.
   * A pontuação volta ao valor que o jogador tinha ao entrar na fase.
   */
  resetGame() {
    const level = this.level;
    this.score = this.levelStartScore;
    this.lives = START_LIVES;
    this.oxygenMax = level.oxygenSeconds;
    this.oxygenSeconds = level.oxygenSeconds;
    this.elapsedSeconds = 0;
    this.trashCollected = 0;
    this.turtleRescued = false;
    this.missionBonusAwarded = false;
    this.endReason = "";

    this.player = createPlayer();
    this.trashItems = createTrashItems();
    this.oxygenBubbles = createInitialBubbles(this.player, this.hasBubbles);
    this.turtle = createTurtle(level.turtleSpeed);
    this.enemies = createInitialEnemies(this.player, level.jellyfishCount);
    // Água-viva mãe fica fora de `enemies`: não conta no limite e tem colisão própria.
    this.giantJellyfish = level.giantJellyfish ? createGiantJellyfish(this.player) : null;
    this.difficulty = createDifficulty(level.difficultySteps, level.jellyfishMax);
    this.bubbleSpawnTimer = 0;

    this.effects = [];
    this.damageFlashTimer = 0;
    this.announcement = { text: "", timer: 0 };
    this.announce(level.intro);

    this.input.clear();
  }

  // ---------- Transições de estado (centralizadas) ----------

  setState(nextState) {
    if (nextState === this.state) {
      return;
    }
    const previous = this.state;
    this.state = nextState;
    this.input.clear(); // evita teclas "presas" entre estados
    if (this.onStateChange) {
      this.onStateChange(nextState, previous);
    }
  }

  /** Nova partida desde a fase 1 (botão Jogar / Jogar novamente após vencer). */
  startNewGame() {
    this.startLevel(0, 0);
  }

  /** Repete a fase atual (Reiniciar na pausa / Tentar novamente no Game Over). */
  restartLevel() {
    this.startLevel(this.levelIndex, this.levelStartScore);
  }

  /** Avança para a próxima fase mantendo a pontuação acumulada. */
  nextLevel() {
    if (this.state === GameState.LEVEL_COMPLETE && !this.isLastLevel) {
      this.startLevel(this.levelIndex + 1, this.score);
    }
  }

  startLevel(index, startScore) {
    this.levelIndex = index;
    this.levelStartScore = startScore;
    this.resetGame();
    this.hasMatch = true;
    this.setState(GameState.PLAYING);
  }

  goToMenu() {
    this.hasMatch = false;
    this.setState(GameState.MENU);
  }

  showInstructions() {
    this.setState(GameState.INSTRUCTIONS);
  }

  showCredits() {
    this.setState(GameState.CREDITS);
  }

  pause() {
    if (this.state === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
    }
  }

  resume() {
    if (this.state === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
    }
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.pause();
    } else if (this.state === GameState.PAUSED) {
      this.resume();
    }
  }

  isMatchVisible() {
    return this.hasMatch && MATCH_STATES.has(this.state);
  }

  // ---------- Atualização ----------

  /** Chamado uma vez por frame pelo game loop. */
  tick(deltaTime) {
    if (this.state === GameState.PAUSED) {
      return; // tudo congelado
    }
    this.ambientTime += deltaTime;
    if (this.state === GameState.PLAYING) {
      this.update(deltaTime);
    }
  }

  update(deltaTime) {
    this.elapsedSeconds += deltaTime;
    this.oxygenSeconds = Math.max(0, this.oxygenSeconds - deltaTime);

    // 1. Movimento das entidades
    updatePlayer(this.player, this.input.getAxis(), deltaTime);
    if (updateDifficulty(this.difficulty, this.elapsedSeconds, this.enemies, this.player)) {
      this.announce("As águas-vivas estão mais agitadas!");
    }
    updateEnemies(this.enemies, deltaTime, this.difficulty.speedMultiplier);
    if (this.giantJellyfish) {
      const giantSpeed = this.difficulty.speedMultiplier * GIANT_JELLYFISH.speedFactor;
      updateEnemies([this.giantJellyfish], deltaTime, giantSpeed);
    }
    updateTrashItems(this.trashItems, deltaTime);
    updateBubbles(this.oxygenBubbles, deltaTime);
    this.updateBubbleSpawner(deltaTime);
    updateTurtle(this.turtle, deltaTime);

    // 2. Colisões (etapa única e bem definida)
    this.resolveCollisions();

    // 3. Efeitos visuais e timers de feedback
    updateEffects(this.effects, deltaTime);
    this.damageFlashTimer = Math.max(0, this.damageFlashTimer - deltaTime);
    this.announcement.timer = Math.max(0, this.announcement.timer - deltaTime);

    // 4. Condições de fim
    this.checkEndConditions();
  }

  /** A cada 15 s de partida, tenta criar uma bolha se houver menos de 3 ativas. */
  updateBubbleSpawner(deltaTime) {
    if (!this.hasBubbles) return;
    this.bubbleSpawnTimer += deltaTime;
    if (this.bubbleSpawnTimer < BUBBLE.spawnInterval) {
      return;
    }
    this.bubbleSpawnTimer -= BUBBLE.spawnInterval;
    if (this.oxygenBubbles.length < BUBBLE.maxActive) {
      this.oxygenBubbles.push(createBubble([
        { x: this.player.x, y: this.player.y, minDistance: 120 },
      ]));
    }
  }

  resolveCollisions() {
    const player = this.player;

    // Resíduos: percorre de trás para frente para remover sem pular elementos.
    for (let i = this.trashItems.length - 1; i >= 0; i--) {
      const item = this.trashItems[i];
      if (circlesOverlap(player, item)) {
        this.trashItems.splice(i, 1);
        this.trashCollected++;
        this.addScore(item.points);
        addFloatingText(this.effects, `+${item.points}`, item.x, item.y - 16, "#ffd84d");
        addRing(this.effects, item.x, item.y, "#ffd84d");
      }
    }

    // Bolhas de oxigênio
    for (let i = this.oxygenBubbles.length - 1; i >= 0; i--) {
      const bubble = this.oxygenBubbles[i];
      if (circlesOverlap(player, bubble)) {
        this.oxygenBubbles.splice(i, 1);
        const bonus = this.level.bubbleOxygen;
        this.oxygenSeconds = Math.min(this.oxygenMax, this.oxygenSeconds + bonus);
        addFloatingText(this.effects, `+${bonus} s O₂`, bubble.x, bubble.y - 18, "#5ff4ff");
        addRing(this.effects, bubble.x, bubble.y, "#5ff4ff");
      }
    }

    // Tartaruga: resgate acontece uma única vez.
    if (!this.turtleRescued && circlesOverlap(player, this.turtle)) {
      this.turtleRescued = true;
      this.turtle.rescued = true;
      this.addScore(TURTLE.rescuePoints);
      addFloatingText(this.effects, `+${TURTLE.rescuePoints} Tartaruga resgatada!`, this.turtle.x, this.turtle.y - 40, "#8dff7a");
      addRing(this.effects, this.turtle.x, this.turtle.y, "#8dff7a");
    }

    // Água-viva mãe: um toque tira todas as vidas, mesmo durante a invulnerabilidade.
    if (this.giantJellyfish && circleRectOverlap(player, this.giantJellyfish.hitbox)) {
      this.lives = 0;
      this.endReason = "A água-viva mãe te alcançou!";
      this.damageFlashTimer = DAMAGE_FLASH_SECONDS;
      return;
    }

    // Águas-vivas: o dano só ocorre fora do período de invulnerabilidade.
    for (const jelly of this.enemies) {
      if (circleRectOverlap(player, jelly.hitbox) && tryDamagePlayer(player)) {
        this.lives--;
        this.damageFlashTimer = DAMAGE_FLASH_SECONDS;
        addFloatingText(this.effects, "-1 vida", player.x, player.y - 30, "#ff6b7a");
        break; // no máximo uma vida perdida por frame
      }
    }
  }

  addScore(points) {
    this.score += points;
  }

  announce(text) {
    this.announcement.text = text;
    this.announcement.timer = ANNOUNCEMENT_SECONDS;
  }

  isMissionComplete() {
    return this.trashCollected >= this.trashGoal && this.turtleRescued;
  }

  checkEndConditions() {
    // Vitória é verificada primeiro: concluir a missão no último instante conta.
    if (this.isMissionComplete()) {
      if (!this.missionBonusAwarded) {
        this.missionBonusAwarded = true;
        this.addScore(MISSION_BONUS);
      }
      this.setState(this.isLastLevel ? GameState.VICTORY : GameState.LEVEL_COMPLETE);
      return;
    }
    if (this.lives <= 0) {
      this.lives = 0;
      this.endReason ||= "Você perdeu todas as vidas."; // mantém o motivo específico, se houver
      this.setState(GameState.GAME_OVER);
    } else if (this.oxygenSeconds <= 0) {
      this.endReason = "O oxigênio acabou.";
      this.setState(GameState.GAME_OVER);
    }
  }
}
