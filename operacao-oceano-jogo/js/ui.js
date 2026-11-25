// Interface HTML: overlays (menus, pausa, resultados) e HUD sobre o Canvas.
import { START_LIVES, LEVELS } from "./config.js";

const HUD_STATES = new Set(["playing", "paused"]);
// Alerta de oxigênio baixo: último terço do tanque da fase (60 s → 20 s, 40 s → ~13 s).
const LOW_OXYGEN_FRACTION = 1 / 3;

export class UI {
  constructor(container, actions) {
    this.container = container;
    this.overlays = Array.from(container.querySelectorAll("[data-screen]"));
    this.hud = container.querySelector("#hud");
    this.elements = {
      hearts: Array.from(container.querySelectorAll(".heart")),
      livesText: container.querySelector("#hud-lives-text"),
      oxygenBar: container.querySelector("#hud-oxygen-bar"),
      oxygenFill: container.querySelector("#hud-oxygen-fill"),
      oxygenText: container.querySelector("#hud-oxygen-text"),
      level: container.querySelector("#hud-level"),
      score: container.querySelector("#hud-score"),
      trash: container.querySelector("#hud-trash"),
      turtle: container.querySelector("#hud-turtle"),
      playButton: container.querySelector("#play-button"),
      loadingStatus: container.querySelector("#loading-status"),
      levelCompleteTitle: container.querySelector("#level-complete-title"),
      levelCompleteScore: container.querySelector("#level-complete-score"),
      levelCompleteNext: container.querySelector("#level-complete-next"),
      victoryScore: container.querySelector("#victory-score"),
      victoryDetails: container.querySelector("#victory-details"),
      gameOverScore: container.querySelector("#game-over-score"),
      gameOverReason: container.querySelector("#game-over-reason"),
    };
    // Último valor exibido: o DOM só é alterado quando algo muda.
    this.hudCache = {};

    // Um único listener (delegação de eventos) para todos os botões com data-action.
    container.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button || button.disabled) return;
      const action = actions[button.dataset.action];
      if (action) action();
    });
  }

  setLoading(isLoading) {
    this.elements.playButton.disabled = isLoading;
    this.elements.loadingStatus.textContent = isLoading ? "Carregando imagens..." : "";
  }

  showScreen(state, game) {
    if (state === "levelComplete") this.fillLevelComplete(game);
    if (state === "victory") this.fillVictory(game);
    if (state === "gameOver") this.fillGameOver(game);

    let visibleOverlay = null;
    for (const overlay of this.overlays) {
      // O atributo hidden remove o overlay da tela e da navegação por Tab.
      overlay.hidden = overlay.dataset.screen !== state;
      if (!overlay.hidden) visibleOverlay = overlay;
    }
    this.hud.hidden = !HUD_STATES.has(state);
    if (this.hud.hidden === false) this.updateHud(game);

    if (visibleOverlay) {
      const firstButton = visibleOverlay.querySelector("button:not([disabled])");
      if (firstButton) firstButton.focus();
    } else {
      // Durante o jogo, o foco vai para a área do jogo (não para um botão escondido).
      this.container.focus();
    }
  }

  fillLevelComplete(game) {
    const next = LEVELS[game.levelIndex + 1];
    this.elements.levelCompleteTitle.textContent = `Fase ${game.level.number} concluída!`;
    this.elements.levelCompleteScore.textContent = game.score;
    const current = game.level;
    const details = [`${next.oxygenSeconds} s de oxigênio`, `${next.jellyfishCount} águas-vivas`];
    if (next.bubbleOxygen === 0) details.push("sem bolhas de oxigênio");
    else if (next.bubbleOxygen !== current.bubbleOxygen) details.push(`bolhas valem +${next.bubbleOxygen} s`);
    if (next.trashGoal !== current.trashGoal) details.push(`colete todos os ${next.trashGoal} resíduos`);
    if (next.giantJellyfish && !current.giantJellyfish) details.push("cuidado com a água-viva mãe: um toque e é fim de jogo");
    if (next.turtleSpeed > current.turtleSpeed) {
      details.push(current.turtleSpeed > 0 ? "a tartaruga nada mais rápido" : "a tartaruga nada pelo recife");
    }
    this.elements.levelCompleteNext.textContent = `Próxima: Fase ${next.number} — ${details.join(", ")}.`;
  }

  fillVictory(game) {
    this.elements.victoryScore.textContent = game.score;
    this.elements.victoryDetails.textContent =
      `Todas as ${LEVELS.length} fases concluídas · Resíduos na última fase: ${game.trashCollected} · Tempo da última fase: ${Math.ceil(game.elapsedSeconds)} s`;
  }

  fillGameOver(game) {
    this.elements.gameOverScore.textContent = game.score;
    this.elements.gameOverReason.textContent =
      `Fase ${game.level.number}: ${game.endReason} Resíduos: ${game.trashCollected}/${game.trashGoal} · Tartaruga: ${game.turtleRescued ? "resgatada" : "não resgatada"}`;
  }

  setIfChanged(key, value, apply) {
    if (this.hudCache[key] === value) return;
    this.hudCache[key] = value;
    apply(value);
  }

  updateHud(game) {
    const el = this.elements;

    this.setIfChanged("lives", game.lives, (lives) => {
      el.hearts.forEach((heart, index) => heart.classList.toggle("lost", index >= lives));
      el.livesText.textContent = `${lives}/${START_LIVES}`;
    });

    this.setIfChanged("level", game.level.number, (number) => {
      el.level.textContent = `${number}/${LEVELS.length}`;
    });
    this.setIfChanged("oxygenMax", game.oxygenMax, (max) => {
      el.oxygenBar.setAttribute("aria-valuemax", max);
    });

    const oxygenPercent = (game.oxygenSeconds / game.oxygenMax) * 100;
    // Barra suave: atualiza a largura com décimos de precisão.
    this.setIfChanged("oxygenWidth", oxygenPercent.toFixed(1), (percent) => {
      el.oxygenFill.style.width = `${percent}%`;
    });
    this.setIfChanged("oxygenSeconds", Math.ceil(game.oxygenSeconds), (seconds) => {
      el.oxygenText.textContent = `${seconds} s`;
      el.oxygenBar.setAttribute("aria-valuenow", seconds);
    });
    this.setIfChanged("oxygenLow", game.oxygenSeconds <= game.oxygenMax * LOW_OXYGEN_FRACTION, (isLow) => {
      this.hud.classList.toggle("oxygen-low", isLow);
    });

    this.setIfChanged("score", game.score, (score) => {
      el.score.textContent = score;
    });
    this.setIfChanged("trash", `${game.trashCollected}/${game.trashGoal}`, (text) => {
      el.trash.textContent = text;
      el.trash.classList.toggle("done", game.trashCollected >= game.trashGoal);
    });
    this.setIfChanged("turtle", game.turtleRescued, (rescued) => {
      el.turtle.textContent = rescued ? "resgatada" : "pendente";
      el.turtle.classList.toggle("done", rescued);
    });
  }
}
