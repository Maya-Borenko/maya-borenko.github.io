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
  {
    src: "./img/partners/rostec.jpg",
    alt: "Госкорпорация Ростех",
    name: "Госкорпорация Ростех",
    key: "rostec",
  },
  {
    src: "./img/partners/rosatom.jpg",
    alt: "Росатом",
    name: "Росатом",
    key: "rosatom",
  },
  {
    src: "./img/partners/samsung.png",
    alt: "IT-школа Samsung",
    name: "IT-школа Samsung",
    key: "it_school",
  },
  {
    src: "./img/partners/yandex.jpg",
    alt: "Яндекс.Лицей",
    name: "Яндекс.Лицей",
    key: "yandex_lyceum",
  },
  {
    src: "./img/partners/1C.jpg",
    alt: "Фирма 1С",
    name: "Фирма 1С",
    key: "1c",
  },
  { src: "./img/partners/croc.jpg", alt: "КРОК", name: "КРОК", key: "krok" },
  {
    src: "./img/partners/astra.jpg",
    alt: "Группа Астра",
    name: "Группа Астра",
    key: "astra",
  },
  {
    src: "./img/partners/sibur.png",
    alt: "Сибур",
    name: "Сибур",
    key: "sibur",
  },
  {
    src: "./img/partners/generium.png",
    alt: "Генериум",
    name: "Генериум",
    key: "generium",
  },
  {
    src: "./img/partners/rosel.png",
    alt: "Росэлектроника",
    name: "Росэлектроника",
    key: "roselectronic",
  },
  {
    src: "./img/partners/ascon.jpg",
    alt: "Аскон",
    name: "Аскон",
    key: "ascon",
  },
  {
    src: "./img/partners/roscosmos.jpg",
    alt: "Роскосмос",
    name: "Роскосмос",
    key: "rosspace",
  },
  {
    src: "./img/partners/rosreestr.png",
    alt: "Росреестр",
    name: "Росреестр",
    key: "rosrosreestr",
  },
  {
    src: "./img/partners/solar.jpg",
    alt: "Ростелеком Солар",
    name: "Ростелеком Солар",
    key: "solar",
  },
  {
    src: "./img/partners/eremex.jpg",
    alt: "Эремекс",
    name: "Эремекс",
    key: "eremex",
  },
  {
    src: "./img/partners/kurchatov_institute.png",
    alt: "Курчатовский институт",
    name: "Курчатовский институт",
    key: "kurchatov_institute",
  },
  {
    src: "./img/partners/uchim_znayem.png",
    alt: "УчимЗнаем",
    name: "УчимЗнаем",
    key: "uchim_znayem",
  },
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
  rostelecom: "Национальный оператор связи, интернет и цифровые платформы.",
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

  const currentRow = track.querySelector(".partners-row");
  if (!currentRow) return;

  const rowHeight = 236;

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

    track.style.transition = "none";
    track.style.transform = "translateY(0)";

    updateSliderDots();

    setTimeout(() => {
      track.style.transition = "";
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

document.addEventListener("DOMContentLoaded", function () {
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
    slider.addEventListener("mouseenter", stopPartnersSlider);
    slider.addEventListener("mouseleave", startPartnersSlider);
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
      const partner = partnersAll.find((p) => p.key === key);

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
  return [
    "воскресенье",
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
  ][d.getDay()];
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRuDate(d) {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
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
  document.getElementById("weekdayText").textContent = capitalizeFirst(weekday);
  document.getElementById("fulldate").textContent = formatRuDate(now);
  setTimeout(syncHeaderBlocks, 50);
}
setInterval(updateDateTime, 1000);
updateDateTime();

const API_KEY = "1df2eb92e9b510458f1e2edebaace0eb";
const CITY = "Moscow";

function getWeatherType(weatherData) {
  if (!weatherData.weather || weatherData.weather.length === 0) {
    return "default";
  }

  const weatherId = weatherData.weather[0].id;
  const clouds = weatherData.clouds?.all || 0;
  console.log(`Weather ID: ${weatherId}`);
  if (weatherId >= 200 && weatherId < 300) {
    return "thunderstorm";
  } else if (weatherId >= 300 && weatherId < 400) {
    return "rain";
  } else if (weatherId >= 500 && weatherId < 600) {
    return "rain";
  } else if (weatherId >= 600 && weatherId < 700) {
    return "snow";
  } else if (weatherId >= 700 && weatherId < 800) {
    return "fog";
  } else if (weatherId === 800) {
    if (clouds < 20) {
      return "sunny";
    } else {
      return "cloudy";
    }
  } else if (weatherId === 801) {
    return "cloudy";
  } else if (weatherId === 802) {
    return "cloudy";
  } else if (weatherId === 803 || weatherId === 804) {
    return "default";
  }

  return "default";
}

function updateWeatherIcon(weatherType) {
  const weatherIcon = document.querySelector(".weather-icon img");
  if (!weatherIcon) return;

  const iconMap = {
    sunny: "weather-sunny.png",
    cloudy: "weather-cloudy.png",
    rain: "weather-rain.png",
    thunderstorm: "weather-thunderstorm.png",
    snow: "weather-snow.png",
    fog: "weather-fog.png",
    default: "weather-icon.png",
  };

  const iconFile = iconMap[weatherType] || "weather-icon.png";
  weatherIcon.src = `./img/${iconFile}`;
  weatherIcon.alt = `Иконка погоды: ${weatherType}`;
  console.log(`Weather type: ${weatherType}`);
}

const WEATHER_LATITUDE = 55.66;
const WEATHER_LONGITUDE = 37.47;
const WEATHER_TIMEZONE = "Europe/Moscow";

// Open-Meteo API
const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${WEATHER_LATITUDE}` +
  `&longitude=${WEATHER_LONGITUDE}` +
  `&hourly=temperature_2m,weather_code,precipitation,surface_pressure,wind_speed_10m,dew_point_2m,apparent_temperature,cloud_cover,relative_humidity_2m` +
  `&daily=sunrise,sunset` +
  `&timezone=${encodeURIComponent(WEATHER_TIMEZONE)}` +
  `&wind_speed_unit=ms`;

function getMoscowHourString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WEATHER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:00`;
}

function getWeatherType(weatherCode, cloudCover = 0) {
  if (weatherCode === 0) {
    return cloudCover >= 20 ? "cloudy" : "sunny";
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return "cloudy";
  }

  if ([45, 48].includes(weatherCode)) {
    return "fog";
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return "rain";
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "snow";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "thunderstorm";
  }

  return "default";
}

function updateWeatherIcon(weatherType) {
  const weatherIcon = document.querySelector(".weather-icon img");
  if (!weatherIcon) return;

  const iconMap = {
    sunny: "weather-sunny.png",
    cloudy: "weather-cloudy.png",
    rain: "weather-rain.png",
    thunderstorm: "weather-thunderstorm.png",
    snow: "weather-snow.png",
    fog: "weather-fog.png",
    default: "weather-icon.png",
  };

  const iconFile = iconMap[weatherType] || "weather-icon.png";

  weatherIcon.src = `./img/${iconFile}`;
  weatherIcon.alt = `Иконка погоды: ${weatherType}`;
}

function setWeatherText(id, value, fallback = "--") {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? fallback;
  }
}

function formatTemperature(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  const rounded = Math.round(value);

  return `${rounded > 0 ? "+" : ""}${rounded}°`;
}

function formatPressure(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 0.750062)} мм рт. ст.`;
}

function formatMoscowTime(value) {
  if (!value) return "--:--";

  const timePart = value.split("T")[1];

  return timePart ? timePart.slice(0, 5) : "--:--";
}

function fetchWeather() {
  fetch(OPEN_METEO_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Open-Meteo вернул HTTP ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      if (!data.hourly || !Array.isArray(data.hourly.time)) {
        throw new Error("В ответе Open-Meteo отсутствуют часовые данные");
      }

      const hourly = data.hourly;
      const targetTime = getMoscowHourString();

      let hourIndex = hourly.time.indexOf(targetTime);

      if (hourIndex === -1) {
        const now = new Date();
        const targetTimestamp = now.getTime();

        let minDifference = Infinity;

        hourly.time.forEach((time, index) => {
          const [datePart, timePart] = time.split("T");

          const [year, month, day] = datePart.split("-").map(Number);

          const [hour, minute] = timePart.split(":").map(Number);

          const candidate = new Date(
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
              2,
              "0",
            )}T${String(hour).padStart(
              2,
              "0",
            )}:${String(minute).padStart(2, "0")}:00+03:00`,
          );

          const difference = Math.abs(candidate.getTime() - targetTimestamp);

          if (difference < minDifference) {
            minDifference = difference;
            hourIndex = index;
          }
        });
      }

      if (hourIndex < 0) {
        throw new Error("Не удалось определить текущий час в прогнозе");
      }

      const valueAt = (key) => hourly[key]?.[hourIndex];

      const temperature = valueAt("temperature_2m");
      const apparentTemperature = valueAt("apparent_temperature");
      const windSpeed = valueAt("wind_speed_10m");
      const pressure = valueAt("surface_pressure");
      const humidity = valueAt("relative_humidity_2m");
      const weatherCode = valueAt("weather_code");
      const cloudCover = valueAt("cloud_cover");

      setWeatherText("weather-temp", formatTemperature(temperature));

      setWeatherText(
        "weather-feel",
        apparentTemperature !== null && apparentTemperature !== undefined
          ? `по ощущениям ${formatTemperature(apparentTemperature)}`
          : "",
        "",
      );

      setWeatherText(
        "weather-wind",
        windSpeed !== null && windSpeed !== undefined
          ? `${Math.round(windSpeed * 10) / 10} м/с`
          : "--",
      );

      setWeatherText("weather-pressure", formatPressure(pressure));

      setWeatherText(
        "weather-humidity",
        humidity !== null && humidity !== undefined
          ? `${Math.round(humidity)}%`
          : "--",
      );

      const sunrise = data.daily?.sunrise?.[0];
      const sunset = data.daily?.sunset?.[0];

      setWeatherText("sunrise", formatMoscowTime(sunrise));

      setWeatherText("sunset", formatMoscowTime(sunset));

      updateWeatherIcon(getWeatherType(weatherCode, cloudCover));
    })
    .catch((error) => {
      console.error("Ошибка при получении погоды (Open-Meteo):", error);

      setWeatherText("weather-temp", "--");
      setWeatherText("weather-feel", "", "");
      setWeatherText("weather-wind", "--");
      setWeatherText("weather-pressure", "--");
      setWeatherText("weather-humidity", "--");
      setWeatherText("sunrise", "--:--");
      setWeatherText("sunset", "--:--");

      updateWeatherIcon("default");
    });
}

fetchWeather();

setInterval(fetchWeather, 600000);
