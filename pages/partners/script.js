function syncHeaderBlocks() {
    const titleCard = document.getElementById("mainTitleCard");
    const dateCard = document.querySelector(".weather-time-wrapper");
    if (titleCard && dateCard) {
        dateCard.style.minHeight = titleCard.offsetHeight + "px";
    }
}
window.addEventListener("resize", syncHeaderBlocks);
window.addEventListener("DOMContentLoaded", syncHeaderBlocks);

const partnersAll = [
    { src: "./img/partners/rostec.jpg", alt: "Ростех", name: "Ростех", key: "rostec" },
    { src: "./img/partners/rosatom.jpg", alt: "Росатом", name: "Росатом", key: "rosatom" },
    { src: "./img/partners/samsung.png", alt: "IT Школа", name: "IT Школа", key: "it_school" },
    { src: "./img/partners/yandex.jpg", alt: "Яндекс Лицей", name: "Яндекс", key: "yandex_lyceum" },
    { src: "./img/partners/1C.jpg", alt: "1C", name: "1C", key: "1c" },
    { src: "./img/partners/croc.jpg", alt: "КРОК", name: "КРОК", key: "krok" },
    { src: "./img/partners/astra.jpg", alt: "Астра", name: "Астра", key: "astra" },
    { src: "./img/partners/sibur.png", alt: "Сибур", name: "Сибур", key: "sibur" },
    { src: "./img/partners/generium.png", alt: "Генериум", name: "Генериум", key: "generium" },
    { src: "./img/partners/rosel.png", alt: "Росэл", name: "Росэл", key: "roselectronic" },
    { src: "./img/partners/ascon.jpg", alt: "Аскон", name: "Аскон", key: "ascon" },
    { src: "./img/partners/roscosmos.jpg", alt: "Роскосмос", name: "Роскосмос", key: "rosspace" },
    { src: "./img/partners/rosreestr.png", alt: "Росреестр", name: "Росреестр", key: "rosrosreestr" },
    { src: "./img/partners/solar.jpg", alt: "Солар", name: "Солар", key: "solar" },
    { src: "./img/partners/eremex.jpg", alt: "Эремекс", name: "Эремекс", key: "eremex" }
];

const partnersDescriptions = {
    rostec: "Госкорпорация, развивающая высокотехнологичные отрасли в России.",
    "1c": "Экосистема ИТ-решений для бизнеса, образования и учёта.",
    krok: "Крупный ИТ-интегратор и поставщик облачных платформ.",
    astra: "Российский разработчик системы Astra Linux.",
    rosatom: "Госкорпорация по атомной энергии, лидер инноваций.",
    yandex_lyceum: "Проект Яндекса для обучения школьников программированию.",
    it_school: "Образовательная инициатива Samsung для ИТ-обучения.",
    solar: "Эксперт в кибербезопасности и цифровой защите.",
    rostelecom: "Национальный оператор связи, интернет и цифровые платформы."
};

//Плитка на 4 партнера в строке с прокруткой вниз
let currentPartnerRow = 0;
const PARTNERS_PER_ROW = 4;
const SCROLL_INTERVAL = 3000;
const ANIMATION_DURATION = 800;
let partnersInterval;
let totalPartnerRows = 0;
let sliderDotsContainer = null;

function calculateTotalRows() {
    totalPartnerRows = Math.ceil(partnersAll.length / PARTNERS_PER_ROW);
    return totalPartnerRows;
}

function getRowPartners(rowIndex) {
    const rowPartners = [];
    const startIndex = rowIndex * PARTNERS_PER_ROW;
    
    for (let i = 0; i < PARTNERS_PER_ROW; i++) {
        const partnerIndex = startIndex + i;
        if (partnerIndex < partnersAll.length) {
            rowPartners.push(partnersAll[partnerIndex]);
        } else {
            rowPartners.push(null);
        }
    }
    
    return rowPartners;
}

function renderPartnersSlider() {
    const track = document.getElementById("partnersTrack");
    if (!track) return;

    track.innerHTML = "";

    calculateTotalRows();
    
    const rowDiv = document.createElement("div");
    rowDiv.className = "partners-row";
    
    const rowPartners = getRowPartners(currentPartnerRow);
    
    rowPartners.forEach((partner, index) => {
        const partnerCell = document.createElement("div");
        partnerCell.className = "partner-cell";
        
        if (partner) {
            partnerCell.setAttribute("data-partner", partner.key);
            partnerCell.innerHTML = `
                <img src="${partner.src}" alt="${partner.alt}">
                <div class="partner-name">${partner.name}</div>
            `;
        } else {
            partnerCell.classList.add("empty-cell");
            partnerCell.innerHTML = `
                <div class="empty-placeholder"></div>
                <div class="partner-name" style="visibility: hidden;">Пусто</div>
            `;
        }
        
        rowDiv.appendChild(partnerCell);
    });
    
    track.appendChild(rowDiv);

    updateSliderDots();
    bindModals();
}

function createSliderDots() {
    const dotsContainer = document.getElementById("sliderDots");
    if (!dotsContainer) return null;
    
    dotsContainer.innerHTML = "";
    
    for (let i = 0; i < totalPartnerRows; i++) {
        const dot = document.createElement("div");
        dot.className = "slider-dot";
        if (i === currentPartnerRow) {
            dot.classList.add("active");
        }
        dotsContainer.appendChild(dot);
    }
    
    return dotsContainer;
}

function updateSliderDots() {
    if (!sliderDotsContainer) {
        sliderDotsContainer = createSliderDots();
    }
    
    const dots = document.querySelectorAll(".slider-dot");
    dots.forEach((dot, index) => {
        if (index === currentPartnerRow) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function slideToNextRow() {
    const track = document.getElementById("partnersTrack");
    if (!track) return;

    const currentRow = track.querySelector('.partners-row');
    if (!currentRow) return;
    
    const rowHeight = currentRow.offsetHeight;
    
    const nextRowIndex = (currentPartnerRow + 1) % totalPartnerRows;
    const nextRowDiv = document.createElement("div");
    nextRowDiv.className = "partners-row next-row";
    nextRowDiv.style.position = "absolute";
    nextRowDiv.style.top = `${rowHeight}px`;
    nextRowDiv.style.left = "0";
    nextRowDiv.style.width = "100%";
    
    const nextRowPartners = getRowPartners(nextRowIndex);
    nextRowPartners.forEach((partner, index) => {
        const partnerCell = document.createElement("div");
        partnerCell.className = "partner-cell";
        
        if (partner) {
            partnerCell.setAttribute("data-partner", partner.key);
            partnerCell.innerHTML = `
                <img src="${partner.src}" alt="${partner.alt}">
                <div class="partner-name">${partner.name}</div>
            `;
        } else {
            partnerCell.classList.add("empty-cell");
            partnerCell.innerHTML = `
                <div class="empty-placeholder"></div>
                <div class="partner-name" style="visibility: hidden;">Пусто</div>
            `;
        }
        
        nextRowDiv.appendChild(partnerCell);
    });
    
    track.appendChild(nextRowDiv);
    
    track.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    track.style.transform = `translateY(-${rowHeight}px)`;

    setTimeout(() => {
        currentPartnerRow = nextRowIndex;
        
        currentRow.remove();
        
        nextRowDiv.className = "partners-row";
        nextRowDiv.style.position = "";
        nextRowDiv.style.top = "";
        nextRowDiv.style.left = "";
        nextRowDiv.style.width = "";
        
        track.style.transition = 'none';
        track.style.transform = 'translateY(0)';
        
        updateSliderDots();
        
        setTimeout(() => {
            track.style.transition = '';
        }, 50);
        
    }, ANIMATION_DURATION);
}

function startPartnersSlider() {
    stopPartnersSlider();
    partnersInterval = setInterval(slideToNextRow, SCROLL_INTERVAL);
}

function stopPartnersSlider() {
    if (partnersInterval) {
        clearInterval(partnersInterval);
        partnersInterval = null;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const slider = document.getElementById("partnersSlider");
    if (slider && !document.getElementById("sliderDots")) {
        const dotsContainer = document.createElement("div");
        dotsContainer.className = "slider-dots";
        dotsContainer.id = "sliderDots";
        slider.appendChild(dotsContainer);
    }
    
    renderPartnersSlider();
    startPartnersSlider();
    
    if (slider) {
        slider.addEventListener('mouseenter', stopPartnersSlider);
        slider.addEventListener('mouseleave', startPartnersSlider);
    }
    
    updateDateTime();
    syncHeaderBlocks();
    fetchWeather();
});

function bindModals() {
    document.querySelectorAll(".partner-cell[data-partner]").forEach((el) => {
        el.onclick = null;
        
        el.onclick = () => {
            const key = el.getAttribute("data-partner");
            const partner = partnersAll.find(p => p.key === key);
            
            if (partner) {
                document.getElementById("modal-title").textContent = partner.name;
                document.getElementById("modal-text").textContent = 
                    partnersDescriptions[key] || "Нет описания.";
                document.getElementById("modal-bg").style.display = "flex";
            }
        };
    });
}


document.getElementById("modal-close").onclick = () => {
    document.getElementById("modal-bg").style.display = "none";
};
document.getElementById("modal-bg").onclick = (e) => {
    if (e.target.id === "modal-bg") {
        document.getElementById("modal-bg").style.display = "none";
    }
};

function leading0(n) {
    return n < 10 ? "0" + n : n;
}

function getRuWeekdayFull(d) {
    return ["воскресенье", "понедельник", "вторник", "среда",
        "четверг", "пятница", "суббота"][d.getDay()];
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRuDate(d) {
    const formatter = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long"
    });
    const parts = formatter.formatToParts(d);
    const dayPart = parts.find((p) => p.type === "day")?.value || "";
    const monthPart = parts.find((p) => p.type === "month")?.value || "";
    return `${dayPart} ${monthPart}`;
}

function updateDateTime() {
    const now = new Date();
    document.getElementById("time").textContent =
        `${leading0(now.getHours())}:${leading0(now.getMinutes())}`;
    const weekday = getRuWeekdayFull(now);
    document.getElementById("weekdayText").textContent =
        capitalizeFirst(weekday);
    document.getElementById("fulldate").textContent = formatRuDate(now);
    setTimeout(syncHeaderBlocks, 50);
}
setInterval(updateDateTime, 1000);
updateDateTime();

const API_KEY = "1df2eb92e9b510458f1e2edebaace0eb";
const CITY = "Moscow";

function fetchWeather() {
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&lang=ru&appid=${API_KEY}`
    )
        .then((r) => r.json())
        .then((data) => {
            const temp = data.main?.temp;
            const feel = data.main?.feels_like;
            const desc = data.weather?.[0]?.description || "";

            document.getElementById("weather-temp").textContent =
                data.main
                    ? (temp > 0 ? "+" : "") + Math.round(temp) + "°"
                    : "--";

            document.getElementById("weather-feel").textContent =
                data.main
                    ? `по ощущениям ${(feel > 0 ? "+" : "") + Math.round(feel)}°`
                    : "";


            document.getElementById("weather-wind").textContent =
                data.wind ? `${data.wind.speed} м/с` : "--";

            document.getElementById("weather-pressure").textContent =
                data.main
                    ? `${Math.round(data.main.pressure * 0.750062)} мм рт. ст.`
                    : "--";

            document.getElementById("weather-humidity").textContent =
                data.main ? `${data.main.humidity}%` : "--";

            const formatTime = (ts) => {
                if (!ts) return "--:--";
                const d = new Date(ts * 1000);
                return leading0(d.getHours()) + ":" + leading0(d.getMinutes());
            };

            document.getElementById("sunrise").textContent =
                formatTime(data.sys?.sunrise);
            document.getElementById("sunset").textContent =
                formatTime(data.sys?.sunset);
        })
        .catch(() => {
            document.getElementById("weather-temp").textContent = "--";
            document.getElementById("weather-feel").textContent = "";
            document.getElementById("weather-desc").textContent = "";
        });
}
fetchWeather();
setInterval(fetchWeather, 600000);
