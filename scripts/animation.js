// Анимация солнца
const sun = document.querySelector(".sun");
document.getElementById("sunriseBtn").onclick = function () {
    sun.classList.add("rise");
    setTimeout(() => sun.classList.remove("rise"), 4000);
};

// Анимация распускания цветка
const pedals = document.querySelectorAll(".petal");
document.getElementById("bloomBtn").onclick = function () {
    pedals.forEach((p, i) => {
        setTimeout(() => p.classList.add("open"), 350 + i * 240);
    });
    setTimeout(() => pedals.forEach((p) => p.classList.remove("open")), 4000);
};
