// bgwords.js

const BG_WORD = ""; // Слово для фона
const ROWS = 7;              // Сколько рядов вертикально
const COLS = 5;              // Сколько слов в ряду
const WORD_SIZE = 4.5;       // Средний размер, vw
const Y_SPACING = 19;        // Интервал между рядами, vh
const X_SPACING = 20;        // Интервал между словами, vw

function createBgWords() {
    if (document.querySelector(".bg-words")) return;
    const bg = document.createElement("div");
    bg.className = "bg-words";
    document.body.prepend(bg);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const div = document.createElement("div");
            div.className = "bg-word";
            div.textContent = BG_WORD;

            // Позиция по сетке
            const left = 2 + col * X_SPACING; // vw
            // Каждая строка стартует чуть выше, анимация опускает вниз
            const baseTop = -22 + row * Y_SPACING; // vh
            
            // Отступ по времени: ниже строки двигаются чуть дольше
            const delay = row * 1.4 + col * 0.3;

            div.style.left = left + "vw";
            div.style.top = baseTop + "vh";
            div.style.animationDelay = delay + "s";
            div.style.fontSize = WORD_SIZE + "vw";
            div.style.transform = `rotate(-8deg)`;
            div.style.opacity = "0.11";

            document.querySelector(".bg-words").appendChild(div);
        }
    }
}
window.addEventListener("DOMContentLoaded", createBgWords);
