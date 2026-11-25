// Captura de teclado: guarda o estado das teclas (pressionada/solta) em vez de mover
// o jogador diretamente no evento. O game loop consulta esse estado a cada frame.

const MOVEMENT_KEYS = {
  KeyW: "up", ArrowUp: "up",
  KeyS: "down", ArrowDown: "down",
  KeyA: "left", ArrowLeft: "left",
  KeyD: "right", ArrowRight: "right",
};

const PAUSE_KEYS = new Set(["KeyP", "Escape"]);

export class InputManager {
  constructor() {
    this.pressed = { up: false, down: false, left: false, right: false };
    this.axis = { x: 0, y: 0 }; // objeto reutilizado para não alocar a cada frame
    this.onPauseKey = null;

    // Listeners registrados uma única vez, durante toda a vida da página.
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));
    window.addEventListener("blur", () => this.clear());
  }

  handleKeyDown(event) {
    const direction = MOVEMENT_KEYS[event.code];
    if (direction) {
      // Impede que as setas rolem a página.
      event.preventDefault();
      this.pressed[direction] = true;
      return;
    }
    if (PAUSE_KEYS.has(event.code) && !event.repeat && this.onPauseKey) {
      event.preventDefault();
      this.onPauseKey();
    }
  }

  handleKeyUp(event) {
    const direction = MOVEMENT_KEYS[event.code];
    if (direction) {
      this.pressed[direction] = false;
    }
  }

  /** Eixos de movimento: -1, 0 ou 1 em cada direção. */
  getAxis() {
    const p = this.pressed;
    this.axis.x = (p.right ? 1 : 0) - (p.left ? 1 : 0);
    this.axis.y = (p.down ? 1 : 0) - (p.up ? 1 : 0);
    return this.axis;
  }

  /** Solta todas as teclas (pausa, troca de estado, perda de foco). */
  clear() {
    for (const direction in this.pressed) {
      this.pressed[direction] = false;
    }
  }
}
