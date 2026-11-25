# 🌊 Operação Oceano: Guardião do Recife

**Operação Oceano: Guardião do Recife** é um jogo arcade 2D de exploração e sobrevivência submarina, desenvolvido como projeto acadêmico utilizando apenas HTML, CSS e JavaScript.

No jogo, você assume o papel de um mergulhador que precisa explorar o fundo do oceano, recolher resíduos, recuperar oxigênio, escapar de águas-vivas e resgatar uma tartaruga marinha. Tudo isso antes que o oxigênio acabe!

A aventura é dividida em quatro fases, cada uma com desafios e níveis de dificuldade diferentes. Conforme o jogador avança, o tempo fica mais limitado e os perigos aumentam.

---

## 🛠️ Tecnologias utilizadas

O projeto foi desenvolvido utilizando tecnologias web fundamentais, sem frameworks ou bibliotecas externas.

- **HTML5:** responsável pela estrutura das telas, menus, HUD e elementos da interface.
- **CSS3:** utilizado na criação do visual do jogo, organização dos elementos, botões e adaptação para diferentes tamanhos de tela.
- **JavaScript (Vanilla JS):** responsável pelas mecânicas, movimentação, colisões, pontuação, inimigos e gerenciamento das fases.
- **Canvas 2D:** utilizado para desenhar o cenário e os elementos do jogo, incluindo personagens e objetos por meio do método `drawImage()`.

**Uma das principais propostas do projeto foi desenvolver o jogo sem utilizar engines ou frameworks**, aplicando diretamente os conceitos estudados durante a disciplina.

### Requisitos e restrições

- HTML, CSS e JavaScript puro.
- JavaScript moderno com módulos ES Modules.
- Canvas API para renderização 2D.
- `requestAnimationFrame()` para atualização do jogo.
- Sem frameworks como React ou Phaser.
- Sem bibliotecas externas, dependências npm, CDN ou backend.

---

## ▶️ Como executar o jogo

Para executar o projeto, é necessário iniciar um servidor HTTP local. Isso acontece porque o jogo utiliza módulos JavaScript nativos, que podem apresentar restrições quando o arquivo `index.html` é aberto diretamente pelo navegador (`file://`).

Existem duas maneiras simples de iniciar o jogo.

**Opção 1 — Visual Studio Code**

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão Live Server, caso ainda não tenha.
3. Clique com o botão direito no arquivo `index.html`.
4. Selecione **Open with Live Server**.

O navegador será aberto automaticamente com o jogo.

**Opção 2 — Utilizando Python**

Caso tenha Python instalado, abra um terminal na pasta principal do projeto (onde está localizado o `index.html`) e execute:

```bash
python -m http.server 5500
```

Depois, acesse o endereço:

[http://localhost:5500](http://localhost:5500)

---

## 🌐 Publicação online

[OPERAÇÃO OCEANO V1](https://spontaneous-lokum-df0d8f.netlify.app/)

---

## 🎮 Controles

Os controles foram pensados para serem simples e familiares:

| Tecla / Ação       | Função                                                          |
| ------------------ | --------------------------------------------------------------- |
| `W`, `A`, `S`, `D` | Movimentar o mergulhador                                        |
| `↑`, `←`, `↓`, `→` | Alternativa para movimentação                                   |
| `P` ou `Esc`       | Pausar ou retomar a partida                                     |
| Mouse              | Interagir com os botões dos menus e com o botão de pausa da HUD |

É possível movimentar o personagem na diagonal, utilizando duas direções simultaneamente.

A coleta dos resíduos, das bolhas de oxigênio e o resgate da tartaruga acontecem automaticamente quando o mergulhador encosta nesses elementos.

Não existe sistema de ataque ou disparo. O objetivo é explorar, desviar dos perigos e cumprir as missões.

Por segurança, quando o jogador troca de aba ou a janela perde o foco, a partida é pausada automaticamente.

---

## 🎯 Objetivo e regras do jogo

O objetivo principal é limpar o oceano, sobreviver aos perigos e resgatar a tartaruga marinha em cada fase.

Para avançar, é necessário cumprir os objetivos de coleta e resgate antes que o oxigênio ou as vidas acabem.

### Regras principais

- Cada fase começa com **3 vidas**.
- Nas fases 1, 2 e 3, é necessário coletar pelo menos **12 resíduos**, de um total de 15 disponíveis.
- Na fase 4, o jogador precisa coletar **todos os 15 resíduos**.
- Também é obrigatório encostar na tartaruga para concluir o resgate.
- As bolhas de oxigênio recuperam parte do tempo disponível.
- Encostar em uma água-viva resulta na perda de uma vida.
- A partida termina quando as vidas ou o oxigênio chegam a zero antes da conclusão da missão.

### Oxigênio

O oxigênio é um dos recursos mais importantes do jogo. Ele representa o tempo que o mergulhador tem para completar os objetivos.

Cada bolha coletada recupera **12 segundos de oxigênio**. Na terceira fase, esse valor é reduzido para **6 segundos**. A quarta fase não possui bolhas de oxigênio.

As bolhas disponíveis desaparecem após 10 segundos. Além disso, uma nova bolha pode surgir a cada 15 segundos, desde que existam menos de três bolhas disponíveis no cenário.

### Inimigos e colisões

As águas-vivas são os principais perigos encontrados durante a exploração.

Ao encostar em uma delas, o mergulhador perde uma vida e recebe **1,3 segundo de invulnerabilidade**, período durante o qual o personagem pisca para indicar que não pode sofrer outro dano das águas-vivas comuns.

A dificuldade também aumenta conforme a fase avança:

- Nas fases 1 e 2, aos 30 e 60 segundos de fase, as águas-vivas ficam aproximadamente 15% mais rápidas e uma nova unidade é adicionada ao cenário, respeitando o limite de cinco.
- Nas fases 3 e 4, esse aumento acontece uma única vez, aos 15 segundos de fase, com limite de sete águas-vivas comuns.

---

## 🗺️ Fases do jogo

A aventura possui quatro fases, cada uma com suas próprias condições e desafios.

| Fase | Oxigênio inicial | Águas-vivas iniciais | Tartaruga        |
| ---- | ---------------: | -------------------: | ---------------- |
| 1    |      60 segundos |                    3 | Permanece parada |
| 2    |      40 segundos |                    4 | Nada pelo recife |
| 3    |      30 segundos |                    6 | Nada mais rápido |
| 4    |      30 segundos |    6 + água-viva mãe | Nada mais rápido |

**Particularidades das fases:**

**Fase 1 — Primeira exploração**

É o primeiro contato com o ambiente submarino. O jogador tem mais tempo para explorar, aprender os controles, coletar os resíduos e encontrar a tartaruga.

**Fase 2 — Um novo desafio**

O tempo disponível diminui e a quantidade inicial de águas-vivas aumenta. Além disso, a tartaruga passa a se movimentar pelo recife, exigindo mais atenção durante o resgate.

**Fase 3 — Oxigênio limitado**

O mergulhador começa com apenas 30 segundos de oxigênio. As bolhas recuperam somente 6 segundos, e os inimigos se movimentam mais rapidamente.

**Fase 4 — O último desafio**

A fase final é a mais difícil. O jogador começa com 30 segundos de oxigênio, não existem bolhas para recuperar o tempo e é necessário recolher todos os 15 resíduos.

Além das águas-vivas comuns, surge a **água-viva mãe**, uma inimiga gigante que se movimenta duas vezes mais rápido que as demais.

Seu contato com o mergulhador provoca a perda das três vidas de uma só vez, mesmo durante o período de invulnerabilidade.

### Vitória e derrota

Ao concluir a quarta fase, o jogador recebe a mensagem:

**"Parabéns! Oceano limpo!"**

A tela final apresenta a pontuação total acumulada durante a aventura.

Caso perca uma partida, é possível tentar novamente a fase atual, mantendo a pontuação que possuía ao entrar nela, ou recomeçar toda a aventura desde a primeira fase.

As configurações e os parâmetros de cada fase estão centralizados no array `LEVELS`, localizado em `js/config.js`.

---

## ⭐ Sistema de pontuação

As ações realizadas durante a partida geram pontos, incentivando o jogador a explorar o cenário e coletar o máximo possível de resíduos.

| Ação                      |   Pontuação |
| ------------------------- | ----------: |
| Coletar garrafa plástica  |  +10 pontos |
| Coletar sacola plástica   |  +15 pontos |
| Coletar lata              |  +20 pontos |
| Resgatar a tartaruga      | +100 pontos |
| Concluir a missão da fase | +150 pontos |

A pontuação é acumulada entre as quatro fases e apresentada ao jogador ao final da aventura.

---

## 📁 Estrutura do projeto

O código foi dividido em arquivos e módulos com responsabilidades específicas. Essa organização facilita a manutenção, a identificação de problemas e a evolução do jogo.

```text
operacao-oceano-jogo/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── game.js
│   ├── config.js
│   ├── input.js
│   ├── player.js
│   ├── enemies.js
│   ├── collectibles.js
│   ├── collision.js
│   ├── spawn.js
│   ├── effects.js
│   ├── assets.js
│   ├── renderer.js
│   └── ui.js
│
└── assets/
    ├── images/
    └── sounds/
```

### O que cada arquivo faz?

| Arquivo           | Responsabilidade                                             |
| ----------------- | ------------------------------------------------------------ |
| `index.html`      | Estrutura principal, Canvas, HUD e telas do jogo             |
| `style.css`       | Estilização, layout responsivo, painéis e botões             |
| `main.js`         | Inicialização do jogo e execução do game loop                |
| `game.js`         | Gerenciamento dos estados, fases, colisões e pontuação       |
| `config.js`       | Configurações gerais, constantes e parâmetros das fases      |
| `input.js`        | Captura e gerenciamento das teclas pressionadas              |
| `player.js`       | Movimentação, limites e invulnerabilidade do mergulhador     |
| `enemies.js`      | Criação, movimentação e dificuldade dos inimigos             |
| `collectibles.js` | Gerenciamento dos resíduos, bolhas e tartaruga               |
| `collision.js`    | Cálculos de colisão e controle de limites                    |
| `spawn.js`        | Sorteio de posições válidas para os elementos do cenário     |
| `effects.js`      | Efeitos visuais, textos flutuantes e animações de coleta     |
| `assets.js`       | Carregamento das imagens utilizadas no jogo                  |
| `renderer.js`     | Desenho do cenário, personagens, objetos e efeitos no Canvas |
| `ui.js`           | Atualização da HUD e gerenciamento das telas e menus         |

As imagens utilizadas ficam em `assets/images/`. A pasta `assets/sounds/` está reservada para possíveis efeitos sonoros e músicas em versões futuras.

Os documentos de planejamento, checklist e referências utilizados durante o desenvolvimento ficam em uma pasta separada, chamada `operacao-oceano-claude-context`, e não fazem parte dos arquivos necessários para executar o jogo.

---

## 💻 Alguns detalhes técnicos

Além das funcionalidades visíveis, o projeto utiliza alguns conceitos importantes de programação e desenvolvimento de jogos.

**Game loop e atualização do jogo**

O funcionamento contínuo do jogo é controlado pelo `requestAnimationFrame()`, localizado em `main.js`.

A cada quadro, o sistema calcula o delta time em segundos, limitado a 0,05 segundo, atualiza a lógica do jogo por meio de `game.tick()`, atualiza a HUD e realiza a renderização com `renderer.draw()`.

Existe apenas um loop principal. Quando o jogo é pausado, a atualização da partida é interrompida, sem a necessidade de criar outro loop ao retomá-la.

**Estados do jogo**

O jogo possui diferentes estados para controlar o que está acontecendo em cada momento:

- `menu`
- `instructions`
- `credits`
- `playing`
- `paused`
- `levelComplete`
- `victory`
- `gameOver`

As transições entre esses estados são centralizadas no método `Game.setState()`, facilitando o gerenciamento das telas e do fluxo da partida.

**Animação do personagem**

O mergulhador utiliza um sprite sheet localizado em `assets/images/diver-sheet.svg`.

O arquivo contém dois quadros de animação, cada um com 128 × 80 pixels, posicionados lado a lado.

Para exibir cada quadro, o projeto utiliza o método `drawImage()` com recorte da imagem original:

```javascript
drawImage(img, frame * 128, 0, 128, 80, x, y, width, height);
```

Dessa maneira, é possível alternar entre os quadros e criar a animação do personagem sem precisar carregar uma imagem diferente para cada movimento.

**Sistema de colisões**

As colisões são verificadas por meio de hitboxes, que representam as áreas de contato dos elementos do jogo.

O projeto utiliza:

- Colisão círculo-círculo para o jogador, resíduos, bolhas e tartaruga.
- Colisão círculo-retângulo para as águas-vivas, utilizando uma área menor que o sprite para tornar o contato mais justo.

Também existe uma função `clamp`, utilizada para impedir que o mergulhador ultrapasse os limites da tela.

Para visualizar as hitboxes durante os testes, basta alterar a constante `DEBUG_HITBOXES` para `true`, em `js/config.js`.

**Carregamento de imagens**

Os recursos gráficos são carregados pelo módulo `assets.js`, utilizando `new Image()` e `Promise`.

Isso permite organizar o carregamento dos sprites e garantir que o jogo tenha acesso às imagens antes de utilizá-las na renderização.

Caso alguma imagem não seja carregada, um aviso é registrado no console e uma representação gráfica simples é desenhada em seu lugar, evitando que a ausência de um recurso interrompa completamente a partida.

**Personalização dos créditos**

O nome do autor pode ser alterado diretamente na seção de créditos do arquivo `index.html`.

---

## 🚀 Considerações finais

O desenvolvimento de Operação Oceano foi uma oportunidade de reforçar o conhecimentos já obtidos e colocar em prática os conceitos estudados durante o curso GameDev, explorando desde a estrutura básica de uma página HTML até recursos mais avançados de JavaScript, animação, gerenciamento de objetos e colisões.

Mais do que criar um jogo funcional, a proposta foi desenvolver uma experiência interativa com identidade visual própria, mecânicas de progressão e uma organização de código que facilite futuras melhorias e novas versões.

**Agora é com você: mergulhe, limpe o oceano e ajude a proteger a vida marinha!** 🌊🐢
