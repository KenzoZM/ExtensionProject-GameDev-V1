// Carregamento centralizado das imagens locais (sprites desenhados com drawImage()).

const IMAGE_SOURCES = {
  diver: "assets/images/diver-sheet.svg",
  jellyfish: "assets/images/jellyfish.svg",
  turtle: "assets/images/turtle.svg",
  bottle: "assets/images/plastic-bottle.svg",
  bag: "assets/images/plastic-bag.svg",
  can: "assets/images/can.svg",
  bubble: "assets/images/oxygen-bubble.svg",
};

// Sprite sheet do mergulhador: 2 quadros lado a lado, cada um com 128×80 px.
export const DIVER_FRAME = { width: 128, height: 80, count: 2 };

function loadImage(key, src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve([key, image]);
    image.onerror = () => {
      // Falha recuperável: o renderer desenha uma forma simples no lugar.
      console.warn(`Não foi possível carregar a imagem "${src}". Usando desenho alternativo.`);
      resolve([key, null]);
    };
    image.src = src;
  });
}

/** Carrega todas as imagens e resolve com um objeto { chave: Image | null }. */
export async function loadAssets() {
  const entries = await Promise.all(
    Object.entries(IMAGE_SOURCES).map(([key, src]) => loadImage(key, src)),
  );
  return Object.fromEntries(entries);
}
