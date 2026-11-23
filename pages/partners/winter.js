/* ==============================================================
   WINTER SNOW SIMULATION — Детский технопарк «Альтаир»
   Отдельный Canvas-эффект: снегопад, накопление снега и ветер.
   Не зависит от script.js и newsParser.js.
   ============================================================== */

(() => {
    "use strict";

    // ----------------------------------------------------------
    // 1. НАСТРОЙКИ. При необходимости меняй значения только здесь.
    // ----------------------------------------------------------
    const CONFIG = {
        // Снегопад
        flakesPerSecond: 28,       // Сколько новых снежинок появляется за секунду
        maxFlakes: 300,            // Максимум одновременно существующих снежинок
        initialFlakes: 150,        // Количество снежинок при первой загрузке
        minFallSpeed: 98,          // Минимальная скорость падения, px/sec
        maxFallSpeed: 142,         // Максимальная скорость падения, px/sec

        // Накопление
        maxSnowDepth: 46,          // Максимальная высота сугроба, px
        surfaceStep: 4,            // Шаг поверхности: меньше = более детальный профиль
        accumulationMultiplier: 1.0, // Общая скорость накопления
        windTriggerDepth: 0.74,    // Ветер может начаться при заполнении на 74%

        // Ветер
        windIntervalMin: 150,      // Минимальный интервал между порывами, сек
        windIntervalMax: 230,      // Максимальный интервал между порывами, сек
        windMinCooldown: 85,       // Минимум секунд до внепланового порыва по высоте снега
        windRampDuration: 1.3,     // Нарастание ветра, сек
        windHoldDuration: 3.4,     // Сильная фаза, сек
        windFadeDuration: 2.0,     // Ослабление ветра, сек
        windHorizontalSpeed: 115,  // Горизонтальное смещение снежинок при сильном ветре
        windRemovalRate: 0.105,    // Скорость сдувания накопленного снега
        windRedistribution: 0.16,  // Часть сдуваемого снега переносится по поверхности

        // Снежная пыль
        dustPerSecondAtFullWind: 34,
        maxDustParticles: 150,

        // Производительность
        maxDevicePixelRatio: 2,
        pauseWhenTabHidden: true
    };

    const random = (min, max) => min + Math.random() * (max - min);
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const smoothstep = (value) => {
        const t = clamp(value, 0, 1);
        return t * t * (3 - 2 * t);
    };

    function initWinterSnow() {
        // Не создаём второй Canvas, если скрипт случайно подключили повторно.
        if (document.getElementById("winterSnowCanvas")) return;

        const page = document.querySelector(".page");
        const canvas = document.createElement("canvas");
        canvas.id = "winterSnowCanvas";
        canvas.className = "winter-snow-canvas";
        canvas.setAttribute("aria-hidden", "true");

        // Ставим Canvas после фонового .bg-word, но перед .page.
        // Поэтому снег виден на фоне и под карточками, не перекрывая контент.
        if (page && page.parentNode) {
            page.parentNode.insertBefore(canvas, page);
        } else {
            document.body.insertBefore(canvas, document.body.firstChild);
        }

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
            console.warn("Winter Snow: браузер не поддерживает Canvas 2D.");
            canvas.remove();
            return;
        }

        let width = 0;
        let height = 0;
        let dpr = 1;
        let segmentCount = 0;
        let surface = new Float32Array(0);
        let transfer = new Float32Array(0);
        let surfaceBeforeSmoothing = new Float32Array(0);

        const flakes = [];
        const dust = [];

        let lastFrameTime = 0;
        let elapsed = 0;
        let spawnAccumulator = 0;
        let dustAccumulator = 0;
        let animationFrameId = 0;
        let resizeQueued = false;
        let isPaused = false;

        let windActive = false;
        let windElapsed = 0;
        let windPower = 0;
        let windDirection = 1;
        let lastWindStart = -Infinity;
        let nextWindAt = random(CONFIG.windIntervalMin, CONFIG.windIntervalMax);

        const reducedMotion = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const flakesPerSecond = reducedMotion
            ? CONFIG.flakesPerSecond * 0.55
            : CONFIG.flakesPerSecond;

        // ------------------------------------------------------
        // 2. РАЗМЕР CANVAS И ПРОФИЛЬ СНЕЖНОЙ ПОВЕРХНОСТИ
        // ------------------------------------------------------
        function resizeCanvas() {
            const oldSurface = surface;
            const oldCount = segmentCount;
            const oldWidth = width;

            width = Math.max(1, window.innerWidth);
            height = Math.max(1, window.innerHeight);
            dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio);

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            segmentCount = Math.ceil(width / CONFIG.surfaceStep) + 1;
            surface = new Float32Array(segmentCount);
            transfer = new Float32Array(segmentCount);
            surfaceBeforeSmoothing = new Float32Array(segmentCount);

            if (oldCount > 0 && oldWidth > 0) {
                // Переносим существующий сугроб при изменении размера окна.
                for (let i = 0; i < segmentCount; i++) {
                    const normalizedX = i / Math.max(1, segmentCount - 1);
                    const oldPosition = normalizedX * (oldCount - 1);
                    const left = Math.floor(oldPosition);
                    const right = Math.min(oldCount - 1, left + 1);
                    const part = oldPosition - left;
                    surface[i] = oldSurface[left] * (1 - part) + oldSurface[right] * part;
                }
            } else {
                // Едва заметная начальная снежная кромка вместо абсолютно пустого низа.
                for (let i = 0; i < segmentCount; i++) {
                    surface[i] = random(0.25, 1.15);
                }
            }

            // При уменьшении высоты окна ограничиваем высоту снежного слоя.
            for (let i = 0; i < surface.length; i++) {
                surface[i] = clamp(surface[i], 0, CONFIG.maxSnowDepth);
            }
        }

        // ------------------------------------------------------
        // 3. СОЗДАНИЕ И ПЕРЕЗАПУСК СНЕЖИНОК
        // ------------------------------------------------------
        function resetFlake(flake, initial = false) {
            flake.x = random(0, width);
            flake.y = initial
                ? random(-10, height)
                : random(-Math.max(30, height * 0.16), -8);

            flake.radius = random(0.65, 2.25);
            flake.baseVx = random(-10, 10);
            flake.vx = flake.baseVx;
            flake.vy = random(CONFIG.minFallSpeed, CONFIG.maxFallSpeed);
            flake.opacity = random(0.34, 0.86);
            flake.swayPhase = random(0, Math.PI * 2);
            flake.swaySpeed = random(0.65, 1.8);
            flake.swayAmount = random(4, 15);
            flake.hasCross = flake.radius > 1.55 && Math.random() < 0.28;
        }

        function createFlake(initial = false) {
            const flake = {};
            resetFlake(flake, initial);
            return flake;
        }

        // ------------------------------------------------------
        // 4. ПОПАДАНИЕ СНЕЖИНКИ НА СУГРОБ
        // ------------------------------------------------------
        function addSnowAt(x, radius) {
            const index = clamp(
                Math.round(x / CONFIG.surfaceStep),
                0,
                segmentCount - 1
            );

            const variation = random(0.78, 1.25);
            const mass = (0.82 + radius * 0.30) *
                CONFIG.accumulationMultiplier * variation;

            // Основная часть снега оседает в точке попадания,
            // меньшая часть распределяется по соседним участкам.
            const centerShare = mass * 0.58;
            const sideShare = mass * 0.21;

            surface[index] = Math.min(
                CONFIG.maxSnowDepth,
                surface[index] + centerShare
            );

            if (index > 0) {
                surface[index - 1] = Math.min(
                    CONFIG.maxSnowDepth,
                    surface[index - 1] + sideShare
                );
            }

            if (index < segmentCount - 1) {
                surface[index + 1] = Math.min(
                    CONFIG.maxSnowDepth,
                    surface[index + 1] + sideShare
                );
            }
        }

        function updateFlakes(dt) {
            for (let i = flakes.length - 1; i >= 0; i--) {
                const flake = flakes[i];

                const targetVx = flake.baseVx +
                    windDirection * windPower * CONFIG.windHorizontalSpeed;
                flake.vx += (targetVx - flake.vx) * Math.min(1, dt * 1.5);

                flake.swayPhase += flake.swaySpeed * dt;
                const swayVelocity = Math.sin(flake.swayPhase) * flake.swayAmount;

                flake.x += (flake.vx + swayVelocity) * dt;
                flake.y += flake.vy * dt;

                const surfaceIndex = clamp(
                    Math.round(flake.x / CONFIG.surfaceStep),
                    0,
                    segmentCount - 1
                );
                const surfaceY = height - surface[surfaceIndex];

                if (flake.y + flake.radius >= surfaceY) {
                    addSnowAt(flake.x, flake.radius);
                    resetFlake(flake, false);
                    continue;
                }

                // При сильном ветре частицы, ушедшие за край, возвращаются
                // с наветренной стороны. В спокойную погоду — сверху.
                if (flake.x < -24 || flake.x > width + 24 || flake.y > height + 30) {
                    if (windPower > 0.25 && (flake.x < -24 || flake.x > width + 24)) {
                        flake.x = windDirection > 0 ? -8 : width + 8;
                        flake.y = random(-100, -10);
                        flake.vx = flake.baseVx;
                    } else {
                        resetFlake(flake, false);
                    }
                }
            }
        }

        // ------------------------------------------------------
        // 5. СРЕДНЯЯ ВЫСОТА СНЕГА И УПРАВЛЕНИЕ ВЕТРОМ
        // ------------------------------------------------------
        function getAverageSnowHeight() {
            if (!surface.length) return 0;
            let sum = 0;
            for (let i = 0; i < surface.length; i++) sum += surface[i];
            return sum / surface.length;
        }

        function startWind() {
            windActive = true;
            windElapsed = 0;
            windPower = 0;
            windDirection = Math.random() < 0.5 ? -1 : 1;
            lastWindStart = elapsed;
            dustAccumulator = 0;
        }

        function updateWind(dt) {
            if (!windActive) {
                const snowIsHigh = getAverageSnowHeight() >=
                    CONFIG.maxSnowDepth * CONFIG.windTriggerDepth;
                const cooldownPassed = elapsed - lastWindStart >= CONFIG.windMinCooldown;
                const timerReached = elapsed >= nextWindAt;

                if (timerReached || (snowIsHigh && cooldownPassed)) {
                    startWind();
                } else {
                    windPower = 0;
                    return;
                }
            }

            windElapsed += dt;

            const rampEnd = CONFIG.windRampDuration;
            const holdEnd = rampEnd + CONFIG.windHoldDuration;
            const totalDuration = holdEnd + CONFIG.windFadeDuration;

            if (windElapsed < rampEnd) {
                windPower = smoothstep(windElapsed / rampEnd);
            } else if (windElapsed < holdEnd) {
                windPower = 1;
            } else if (windElapsed < totalDuration) {
                windPower = 1 - smoothstep(
                    (windElapsed - holdEnd) / CONFIG.windFadeDuration
                );
            } else {
                windActive = false;
                windPower = 0;
                nextWindAt = elapsed + random(
                    CONFIG.windIntervalMin,
                    CONFIG.windIntervalMax
                );
                return;
            }
        }

        // ------------------------------------------------------
        // 6. СДУВАНИЕ И ЧАСТИЧНОЕ ПЕРЕРАСПРЕДЕЛЕНИЕ СНЕГА
        // ------------------------------------------------------
        function updateSnowSurface(dt) {
            if (windPower > 0) {
                transfer.fill(0);

                for (let i = 0; i < surface.length; i++) {
                    const currentHeight = surface[i];
                    if (currentHeight <= 0.01) continue;

                    // Экспоненциальное уменьшение даёт плавное сдувание,
                    // а не резкое исчезновение сугроба.
                    const removed = currentHeight * (
                        1 - Math.exp(-CONFIG.windRemovalRate * windPower * dt)
                    );

                    surface[i] = Math.max(0, currentHeight - removed);

                    // Небольшая часть снега переносится по поверхности
                    // в направлении ветра, остальная уходит в снежную пыль.
                    const moved = removed * CONFIG.windRedistribution;
                    const targetIndex = i + windDirection;
                    if (targetIndex >= 0 && targetIndex < surface.length) {
                        transfer[targetIndex] += moved;
                    }
                }

                for (let i = 0; i < surface.length; i++) {
                    surface[i] = Math.min(
                        CONFIG.maxSnowDepth,
                        surface[i] + transfer[i]
                    );
                }
            }

            // Очень лёгкое сглаживание локальных неровностей.
            // Оно не уничтожает сугробы, а смягчает резкие перепады между ячейками.
            if (surface.length > 2) {
                // Сглаживаем по копии, чтобы результат не зависел от направления цикла.
                surfaceBeforeSmoothing.set(surface);
                const smoothingFactor = Math.min(0.018, dt * 0.45);
                for (let i = 1; i < surface.length - 1; i++) {
                    const average = (surfaceBeforeSmoothing[i - 1] +
                        surfaceBeforeSmoothing[i + 1]) * 0.5;
                    surface[i] = clamp(
                        surfaceBeforeSmoothing[i] +
                        (average - surfaceBeforeSmoothing[i]) * smoothingFactor,
                        0,
                        CONFIG.maxSnowDepth
                    );
                }
            }
        }

        // ------------------------------------------------------
        // 7. ЧАСТИЦЫ СНЕЖНОЙ ПЫЛИ ВО ВРЕМЯ ПОРЫВА ВЕТРА
        // ------------------------------------------------------
        function createDustParticle() {
            if (dust.length >= CONFIG.maxDustParticles) return;

            const index = Math.floor(random(0, surface.length));
            const snowHeight = surface[index] || 0;
            const x = index * CONFIG.surfaceStep;
            const y = height - snowHeight - random(0, 3);

            dust.push({
                x,
                y,
                vx: windDirection * random(55, 155),
                vy: -random(18, 72),
                gravity: random(12, 34),
                radius: random(0.65, 2.0),
                life: random(1.0, 2.1),
                maxLife: 0,
                opacity: random(0.28, 0.72)
            });
            dust[dust.length - 1].maxLife = dust[dust.length - 1].life;
        }

        function updateDust(dt) {
            if (windPower > 0.12) {
                dustAccumulator +=
                    CONFIG.dustPerSecondAtFullWind * windPower * dt;

                while (dustAccumulator >= 1) {
                    createDustParticle();
                    dustAccumulator -= 1;
                }
            }

            for (let i = dust.length - 1; i >= 0; i--) {
                const particle = dust[i];
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                particle.vy += particle.gravity * dt;
                particle.life -= dt;

                if (
                    particle.life <= 0 ||
                    particle.x < -40 || particle.x > width + 40 ||
                    particle.y > height + 20
                ) {
                    dust.splice(i, 1);
                }
            }
        }

        // ------------------------------------------------------
        // 8. ОТРИСОВКА СНЕЖИНОК, СУГРОБА И СНЕЖНОЙ ПЫЛИ
        // ------------------------------------------------------
        function drawFlakes() {
            for (let i = 0; i < flakes.length; i++) {
                const flake = flakes[i];
                const alpha = flake.opacity * (1 - windPower * 0.08);

                ctx.fillStyle = `rgba(245, 251, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                ctx.fill();

                // У части крупных снежинок есть едва заметная крестообразная форма.
                if (flake.hasCross) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.72})`;
                    ctx.lineWidth = 0.65;
                    ctx.beginPath();
                    ctx.moveTo(flake.x - flake.radius * 1.5, flake.y);
                    ctx.lineTo(flake.x + flake.radius * 1.5, flake.y);
                    ctx.moveTo(flake.x, flake.y - flake.radius * 1.5);
                    ctx.lineTo(flake.x, flake.y + flake.radius * 1.5);
                    ctx.stroke();
                }
            }
        }

        function drawSnowSurface() {
            if (!surface.length) return;

            const bottom = height;
            const firstY = bottom - surface[0];
            const gradient = ctx.createLinearGradient(0, bottom - CONFIG.maxSnowDepth, 0, bottom);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.99)");
            gradient.addColorStop(0.42, "rgba(239, 248, 255, 0.99)");
            gradient.addColorStop(1, "rgba(202, 226, 246, 0.99)");

            ctx.beginPath();
            ctx.moveTo(0, bottom);
            ctx.lineTo(0, firstY);

            let previousX = 0;
            let previousY = firstY;

            for (let i = 1; i < surface.length; i++) {
                const x = Math.min(width, i * CONFIG.surfaceStep);
                const y = bottom - surface[i];
                const middleX = (previousX + x) * 0.5;
                const middleY = (previousY + y) * 0.5;
                ctx.quadraticCurveTo(previousX, previousY, middleX, middleY);
                previousX = x;
                previousY = y;
            }

            ctx.lineTo(previousX, previousY);
            ctx.lineTo(width, bottom);
            ctx.closePath();

            ctx.fillStyle = gradient;
            ctx.fill();

            // Светлая кромка подчёркивает поверхность сугроба.
            ctx.beginPath();
            ctx.moveTo(0, firstY);
            for (let i = 1; i < surface.length; i++) {
                ctx.lineTo(Math.min(width, i * CONFIG.surfaceStep), bottom - surface[i]);
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
            ctx.lineWidth = 1.4;
            ctx.lineJoin = "round";
            ctx.stroke();
        }

        function drawDust() {
            for (let i = 0; i < dust.length; i++) {
                const particle = dust[i];
                const lifeProgress = clamp(particle.life / particle.maxLife, 0, 1);
                const alpha = particle.opacity * lifeProgress * windPower;

                ctx.fillStyle = `rgba(246, 251, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function render() {
            ctx.clearRect(0, 0, width, height);
            drawFlakes();
            drawSnowSurface();
            drawDust();
        }

        // ------------------------------------------------------
        // 9. ГЛАВНЫЙ ЦИКЛ АНИМАЦИИ
        // ------------------------------------------------------
        function animate(timestamp) {
            if (isPaused) return;

            if (!lastFrameTime) lastFrameTime = timestamp;
            // Ограничиваем dt, чтобы после подвисания не было резкого скачка частиц.
            const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.04);
            lastFrameTime = timestamp;
            elapsed += dt;

            updateWind(dt);
            updateFlakes(dt);
            updateSnowSurface(dt);
            updateDust(dt);

            spawnAccumulator += flakesPerSecond * dt;
            while (spawnAccumulator >= 1 && flakes.length < CONFIG.maxFlakes) {
                flakes.push(createFlake(false));
                spawnAccumulator -= 1;
            }
            if (flakes.length >= CONFIG.maxFlakes) {
                spawnAccumulator = Math.min(spawnAccumulator, 1);
            }

            render();
            animationFrameId = requestAnimationFrame(animate);
        }

        // ------------------------------------------------------
        // 10. ИНИЦИАЛИЗАЦИЯ, ИЗМЕНЕНИЕ РАЗМЕРА И ВИДИМОСТЬ ВКЛАДКИ
        // ------------------------------------------------------
        resizeCanvas();

        const initialCount = Math.min(
            CONFIG.maxFlakes,
            Math.max(CONFIG.initialFlakes, Math.round(width * height / 7000))
        );
        for (let i = 0; i < initialCount; i++) {
            flakes.push(createFlake(true));
        }

        window.addEventListener("resize", () => {
            if (resizeQueued) return;
            resizeQueued = true;
            requestAnimationFrame(() => {
                resizeCanvas();
                resizeQueued = false;
            });
        }, { passive: true });

        if (CONFIG.pauseWhenTabHidden) {
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    isPaused = true;
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    animationFrameId = 0;
                    lastFrameTime = 0;
                } else if (isPaused) {
                    isPaused = false;
                    lastFrameTime = 0;
                    animationFrameId = requestAnimationFrame(animate);
                }
            });
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initWinterSnow, { once: true });
    } else {
        initWinterSnow();
    }
})();