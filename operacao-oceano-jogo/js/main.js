// Ponto de entrada: conecta DOM, entrada, jogo, interface e renderer, e inicia o game loop.
import { MAX_DELTA_TIME } from "./config.js";
import { InputManager } from "./input.js";
import { Game } from "./game.js";
import { Renderer } from "./renderer.js";
import { UI } from "./ui.js";
import { loadAssets } from "./assets.js";

const container = document.getElementById("game-container");
const canvas = document.getElementById("game-canvas");

const input = new InputManager();
const game = new Game(input);
const renderer = new Renderer(canvas);
const ui = new UI(container, {
  play: () => game.startNewGame(),
  instructions: () => game.showInstructions(),
  credits: () => game.showCredits(),
  back: () => game.goToMenu(),
  pause: () => game.pause(),
  resume: () => game.resume(),
  restart: () => game.startNewGame(),
  restartLevel: () => game.restartLevel(),
  nextLevel: () => game.nextLevel(),
  menu: () => game.goToMenu(),
});

game.onStateChange = (state) => ui.showScreen(state, game);
ui.showScreen(game.state, game);

// Ao trocar de aba ou perder o foco, solta as teclas e pausa a partida.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    input.clear();
    game.pause();
  }
});
window.addEventListener("blur", () => game.pause());

// A partida só pode começar depois que as imagens forem carregadas.
ui.setLoading(true);
loadAssets().then((images) => {
  renderer.setImages(images);
  ui.setLoading(false);
});

// ---------- Game loop (único) ----------
let previousTimestamp = null;

function frame(timestamp) {
  if (previousTimestamp === null) previousTimestamp = timestamp;
  // Delta time em segundos, limitado para evitar saltos (ex.: ao voltar de outra aba).
  const deltaTime = Math.min((timestamp - previousTimestamp) / 1000, MAX_DELTA_TIME);
  previousTimestamp = timestamp;

  game.tick(deltaTime);
  if (game.state === "playing") ui.updateHud(game);
  renderer.draw(game);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Exportado apenas para inspeção/testes no console do navegador.
export { game };
