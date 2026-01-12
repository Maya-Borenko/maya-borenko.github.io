const colors = [
    "#FFD700",
    "#FF4081",
    "#40C4FF",
    "#7C4DFF",
    "#FFEB3B",
    "#76FF03",
    "#FF6F00",
];
// Функция создания одного конфетти
function createConfetti(side) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    const size = Math.random() * 12 + 10; // Больше размер: 10px–22px
    conf.style.width = size + "px";
    conf.style.height = size * 1.5 + "px";
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.opacity = 0.8 + Math.random() * 0.2; // Немного рандомная прозрачность

    // Начальное положение
    conf.style.left =
        side === "left"
            ? Math.random() * 40 + "px"
            : window.innerWidth - 40 + Math.random() * 40 + "px";
    conf.style.bottom = "0px";
    conf.style.borderRadius = "50%";
    conf.style.transform = `rotate(${Math.random() * 360}deg) scale(${
        1 + Math.random() * 0.6
    })`;
    conf.style.boxShadow = `0 2px 15px rgba(0,0,0,0.13)`;

    document.body.appendChild(conf);

    // Сильнее движение: больше скорость и разброс
    let angle =
        side === "left" ? Math.random() * 80 + 20 : Math.random() * -80 - 20;
    let x = 0,
        y = 0;
    const gravity = 0.7 + Math.random() * 0.4; // gravity чуть выше
    const speed = 5.5 + Math.random() * 2.5; // speed увеличена
    let opacity = parseFloat(conf.style.opacity);

    // Дополнительное вращение частицы в полёте
    let currentRotation = Math.random() * 360;
    let dRotate = (Math.random() - 0.5) * 10; // от -5 до +5 на каждый кадр

    function animate() {
        y += speed;
        x += Math.sin((angle * Math.PI) / 180) * 2.7;
        currentRotation += dRotate;
        conf.style.transform = `translate(${x}px,-${y}px) rotate(${currentRotation}deg) scale(${
            size / 16
        })`;
        conf.style.opacity = opacity;
        opacity -= 0.017;
        if (y < window.innerHeight * 0.85 && opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            conf.remove();
        }
    }
    animate();
}
// Сильнее поток: чаще создаём конфетти
setInterval(() => createConfetti("left"), 200);
setInterval(() => createConfetti("right"), 200);
