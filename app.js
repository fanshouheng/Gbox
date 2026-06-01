const characters = [
  {
    id: "madness-combat",
    name: "疯狂小人",
    gameName: "疯狂小人战斗",
    rarity: "common",
    image: "./assets/characters/cutouts/madness-combat/cutout.png",
    url: "https://www.4399.com/flash/7624.htm",
    speed: 1.45,
  },
  {
    id: "dad-n-me",
    name: "狂扁小朋友",
    gameName: "狂扁小朋友",
    rarity: "common",
    image: "./assets/characters/cutouts/dad-n-me/cutout.png",
    url: "https://www.4399.com/flash/1406.htm",
    speed: 1.1,
  },
  {
    id: "brave-road-elf-story",
    name: "精灵勇者",
    gameName: "勇者之路精灵物语",
    rarity: "common",
    image: "./assets/characters/cutouts/brave-road-elf-story/cutout.png",
    url: "https://www.4399.com/flash/7473.htm",
    speed: 1.25,
  },
  {
    id: "wheres-my-water-swampy",
    name: "小鳄鱼",
    gameName: "小鳄鱼爱洗澡",
    rarity: "rare",
    image: "./assets/characters/cutouts/wheres-my-water-swampy/cutout.png",
    url: "https://www.4399.com/flash/68876.htm",
    speed: 1.2,
  },
  {
    id: "double-edge-warrior",
    name: "双刃战士",
    gameName: "双刃战士",
    rarity: "common",
    image: "./assets/characters/cutouts/double-edge-warrior/cutout.png",
    url: "https://www.4399.com/flash/12946.htm",
    speed: 1.35,
  },
  {
    id: "chaos-faction-2",
    name: "混乱斗士",
    gameName: "混乱大枪战2",
    rarity: "common",
    image: "./assets/characters/cutouts/chaos-faction-2/cutout.png",
    url: "https://www.4399.com/flash/45727.htm",
    speed: 1.75,
  },
  {
    id: "crazy-flasher-3",
    name: "闪客快打",
    gameName: "闪客快打3",
    rarity: "rare",
    image: "./assets/characters/cutouts/crazy-flasher-3/cutout.png",
    url: "https://www.4399.com/flash/2162.htm",
    speed: 1.8,
  },
  {
    id: "bleach-vs-naruto",
    name: "死神火影",
    gameName: "死神VS火影",
    rarity: "rare",
    image: "./assets/characters/cutouts/bleach-vs-naruto/cutout.png",
    url: "https://www.4399.com/flash/105227.htm",
    speed: 1.55,
  },
  {
    id: "adventure-king",
    name: "冒险王",
    gameName: "冒险王之神兵传奇",
    rarity: "rare",
    image: "./assets/characters/cutouts/adventure-king/cutout.png",
    url: "https://www.4399.com/flash/47402.htm",
    speed: 1.4,
  },
  {
    id: "dream-journey-3",
    name: "造梦西游",
    gameName: "造梦西游3",
    rarity: "hidden",
    image: "./assets/characters/cutouts/dream-journey-3/cutout.png",
    url: "https://www.4399.com/flash/46839.htm",
    speed: 1.5,
  },
  {
    id: "fireboy-watergirl",
    name: "冰火小人",
    gameName: "冰火小人闯关",
    rarity: "common",
    image: "./assets/characters/cutouts/fireboy-watergirl/cutout.png",
    url: "https://www.4399.com/flash/22727.htm",
    speed: 1.6,
  },
  {
    id: "cut-the-rope",
    name: "割绳子",
    gameName: "割绳子",
    rarity: "common",
    image: "./assets/characters/cutouts/cut-the-rope/cutout.png",
    url: "https://www.4399.com/flash/53475.htm",
    speed: 1.05,
  },
  {
    id: "world-of-goo",
    name: "粘粘世界",
    gameName: "粘粘世界",
    rarity: "hidden",
    image: "./assets/characters/cutouts/world-of-goo/cutout.png",
    url: "https://www.4399.com/flash/35187.htm",
    speed: 1.15,
  },
];

const maxCharacters = 13;
const cooldownMs = 950;
const boxButton = document.querySelector("#boxButton");
const gamePanel = document.querySelector("#gamePanel");
const characterLayer = document.querySelector("#characterLayer");
const toast = document.querySelector("#toast");
const hintText = document.querySelector("#hintText");
const firstGuide = document.querySelector("#firstGuide");
const countText = document.querySelector("#countText");
const unlockText = document.querySelector("#unlockText");

let activeCharacters = [];
let isCooling = false;
let animationFrameId = null;
let toastTimer = null;

const unlocked = new Set(readUnlocked());
updateStatus();

boxButton.addEventListener("click", summonCharacter);
window.addEventListener("resize", keepCharactersInBounds);

function summonCharacter() {
  if (isCooling) {
    showToast("盒子正在冷却，等一下再开。");
    return;
  }

  firstGuide.classList.add("is-hidden");

  if (activeCharacters.length >= maxCharacters) {
    showToast("场上角色已满，先点击一个角色进入游戏吧。");
    return;
  }

  isCooling = true;
  boxButton.classList.add("is-opening", "is-cooling");

  const character = pickCharacter();
  const isNew = !unlocked.has(character.id);
  const instance = createCharacter(character);
  activeCharacters.push(instance);
  characterLayer.append(instance.element);

  if (isNew) {
    unlocked.add(character.id);
    saveUnlocked();
    showToast(`新角色解锁：${character.name}`);
  } else {
    showToast(`召唤成功：${character.name}`);
  }

  hintText.textContent = "点击运动中的角色进入游戏，再点盒子还能继续召唤。";
  updateStatus();
  startMovement();

  window.setTimeout(() => {
    boxButton.classList.remove("is-opening", "is-cooling");
    isCooling = false;
  }, cooldownMs);
}

function pickCharacter() {
  const lockedCharacters = characters.filter((character) => !unlocked.has(character.id));

  if (lockedCharacters.length > 0) {
    return lockedCharacters[Math.floor(Math.random() * lockedCharacters.length)];
  }

  const roll = Math.random();
  let pool = characters.filter((character) => character.rarity === "common");

  if (roll > 0.92) {
    pool = characters.filter((character) => character.rarity === "hidden");
  } else if (roll > 0.68) {
    pool = characters.filter((character) => character.rarity === "rare");
  }

  return pool[Math.floor(Math.random() * pool.length)] || characters[0];
}

function createCharacter(character) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = `character ${character.rarity}`;
  element.setAttribute("aria-label", `进入${character.gameName}`);
  element.innerHTML = `
    <span class="character-card">
      <img src="${character.image}" alt="" />
    </span>
    <span class="character-name">${character.name}</span>
  `;

  const bounds = getMovementBounds();
  const boxRect = boxButton.getBoundingClientRect();
  const x = clamp(boxRect.left + boxRect.width / 2 - 48 + randomBetween(-110, 110), bounds.minX, bounds.maxX);
  const y = clamp(boxRect.top + boxRect.height / 2 - 63 + randomBetween(-70, 70), bounds.minY, bounds.maxY);
  const angle = randomBetween(0, Math.PI * 2);
  const speed = character.speed + randomBetween(0, 0.55);

  const instance = {
    data: character,
    element,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };

  element.style.setProperty("--x", `${x}px`);
  element.style.setProperty("--y", `${y}px`);
  element.addEventListener("click", () => openGame(instance));

  return instance;
}

function startMovement() {
  if (animationFrameId) {
    return;
  }

  const tick = () => {
    const bounds = getMovementBounds();

    for (const character of activeCharacters) {
      character.x += character.vx;
      character.y += character.vy;

      if (character.x <= bounds.minX || character.x >= bounds.maxX) {
        character.vx *= -1;
        character.x = clamp(character.x, bounds.minX, bounds.maxX);
      }

      if (character.y <= bounds.minY || character.y >= bounds.maxY) {
        character.vy *= -1;
        character.y = clamp(character.y, bounds.minY, bounds.maxY);
      }

      character.element.style.setProperty("--x", `${character.x}px`);
      character.element.style.setProperty("--y", `${character.y}px`);
    }

    animationFrameId = window.requestAnimationFrame(tick);
  };

  animationFrameId = window.requestAnimationFrame(tick);
}

function openGame(instance) {
  instance.element.classList.add("is-jumping");
  showToast(`正在进入：${instance.data.gameName}`);

  window.setTimeout(() => {
    window.open(instance.data.url, "_blank", "noopener,noreferrer");
  }, 420);
}

function getMovementBounds() {
  const sampleWidth = window.matchMedia("(max-width: 680px)").matches ? 78 : 96;
  const sampleHeight = window.matchMedia("(max-width: 680px)").matches ? 106 : 126;
  const panelRect = gamePanel.getBoundingClientRect();
  const isMobile = window.matchMedia("(max-width: 680px)").matches;
  const sidePadding = isMobile ? 24 : 46;
  const topPadding = isMobile ? 172 : 178;
  const bottomPadding = isMobile ? 124 : 82;

  return {
    minX: panelRect.left + sidePadding,
    minY: panelRect.top + topPadding,
    maxX: Math.max(panelRect.left + sidePadding, panelRect.right - sidePadding - sampleWidth),
    maxY: Math.max(panelRect.top + topPadding, panelRect.bottom - bottomPadding - sampleHeight),
  };
}

function keepCharactersInBounds() {
  const bounds = getMovementBounds();

  for (const character of activeCharacters) {
    character.x = clamp(character.x, bounds.minX, bounds.maxX);
    character.y = clamp(character.y, bounds.minY, bounds.maxY);
    character.element.style.setProperty("--x", `${character.x}px`);
    character.element.style.setProperty("--y", `${character.y}px`);
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}

function updateStatus() {
  countText.textContent = `场上角色 ${activeCharacters.length}/${maxCharacters}`;
  unlockText.textContent = `已解锁 ${unlocked.size}/${characters.length}`;
}

function readUnlocked() {
  try {
    return JSON.parse(window.localStorage.getItem("gbox-unlocked") || "[]");
  } catch {
    return [];
  }
}

function saveUnlocked() {
  window.localStorage.setItem("gbox-unlocked", JSON.stringify([...unlocked]));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
