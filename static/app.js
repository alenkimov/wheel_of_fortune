const reel = document.querySelector("#reel");
const frame = document.querySelector("#frame");
const spin = document.querySelector("#spin");

const revolver = { text: "Игрушечный револьвер", icon: "💥", once: true };

const soda = { text: "Газировка", icon: "🥤", safe: true };
const scary = [
  { text: "Ампутация конечности", icon: "🪚" },
  { text: "Славная смерть", icon: "⚰️" },
  { text: "Болезненное расчленение", icon: "✂️" },
  { text: "Смерть в нищете", icon: "🧾" },
  { text: "Поездка в Европу", icon: "⚔️" },
  { text: "Блокировка карты 161 ФЗ", icon: "💳" },
  { text: "Болезнь Бенджамина Баттона", icon: "👴" },
  { text: "Некроз ног", icon: "🦵" },
  { text: "Повреждение ДНК", icon: "🧬" },
  { text: "Пролапс", icon: "🫠" },
  { text: "Фемоз", icon: "🫣" },
  { text: "Неснимаемые трусы", icon: "🩲" },
  { text: "Врачи не могут обнаружить вашу паховую грыжу", icon: "🏥" },
];

const spinCountKey = "wheelOfFortuneSpinCount";
const revolverWonKey = "wheelOfFortuneRevolverWon";

const savedSpins = Number.parseInt(localStorage.getItem(spinCountKey) || "0", 10);
let spins = Number.isNaN(savedSpins) ? 0 : savedSpins;
let revolverWon = localStorage.getItem(revolverWonKey) === "true";

function prizeMarkup(item) {
  const longTextClass = item.text.length > 28 ? " text-long" : "";
  return `
    <div class="prize">
      <span class="icon">${item.icon}</span>
      <span class="text${longTextClass}">${item.text}</span>
    </div>
  `;
}

function sodaStrip(length) {
  return Array.from({ length }, () => soda);
}

function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function visiblePrizePool() {
  return revolverWon ? scary : [...scary, revolver];
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildSpinStrip(winner = soda) {
  const prizePool = visiblePrizePool();
  const opening = sodaStrip(5);
  const dangerPool = shuffle(
    Array.from({ length: 8 }, () => Math.random() > 0.2 ? randomChoice(prizePool) : soda),
  );
  const noise = Array.from({ length: 4 }, () => Math.random() > 0.34 ? randomChoice(prizePool) : soda);
  const beforeWinner = shuffle([randomChoice(prizePool), randomChoice(prizePool), soda]);
  const finalIndex = opening.length + dangerPool.length + noise.length + beforeWinner.length;
  const afterWinner = shuffle([randomChoice(prizePool), randomChoice(prizePool), soda]);
  const items = [...opening, ...dangerPool, ...noise, ...beforeWinner, winner, ...afterWinner];
  return { items, finalIndex };
}

function renderReel(items, animated = false) {
  reel.classList.toggle("spinning", animated);
  reel.innerHTML = items.map(prizeMarkup).join("");
}

function getReelMetrics() {
  const firstPrize = reel.querySelector(".prize");
  const styles = window.getComputedStyle(reel);
  const gap = parseFloat(styles.rowGap) || 0;
  const paddingTop = parseFloat(styles.paddingTop) || 0;
  const prizeHeight = firstPrize ? firstPrize.offsetHeight : 92;
  return {
    step: prizeHeight + gap,
    prizeCenter: paddingTop + prizeHeight / 2,
  };
}

function setReelPosition(index) {
  const metrics = getReelMetrics();
  const centerOffset = frame.clientHeight / 2 - metrics.prizeCenter;
  reel.style.transform = `translateY(${centerOffset - index * metrics.step}px)`;
}

function showCalm() {
  const items = sodaStrip(12);
  renderReel(items);
  setReelPosition(2);
}

showCalm();

spin.addEventListener("click", () => {
  spin.disabled = true;
  spins += 1;
  localStorage.setItem(spinCountKey, String(spins));
  frame.classList.add("spinning");

  const winner = spins === 69 && !revolverWon ? revolver : soda;
  const { items, finalIndex } = buildSpinStrip(winner);

  if (winner.once) {
    revolverWon = true;
    localStorage.setItem(revolverWonKey, "true");
  }

  renderReel(items);
  setReelPosition(2);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      renderReel(items, true);
      setReelPosition(finalIndex);
    });
  });

  window.setTimeout(() => {
    frame.classList.remove("spinning");
    spin.disabled = false;
  }, 7200);
});
