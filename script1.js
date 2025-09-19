const apiKey = "f0bc607f04454c9fd14931a0314f8e0f";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const airUrl = "https://api.openweathermap.org/data/2.5/air_pollution?";

const topbarCity = document.querySelector(".location");
const topbarTemp = document.querySelector(".temp");
const bigTemp = document.querySelector(".big-temp .value");
const desc = document.querySelector(".desc");
const facts = document.querySelector(".facts");
const todayDate = document.querySelector(".muted");

const searchInput = document.querySelector(".searchbar input");
const searchBtn = document.querySelector(".select");

todayDate.textContent = new Date().toDateString();

// ---------------- Forecast (next 5 hours) ----------------
async function checkForecast(city) {
  try {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    if (!response.ok) throw new Error("Forecast not found");
    const data = await response.json();

    const miniHourBox = document.querySelector(".mini-hour");
    miniHourBox.innerHTML = "";

    // Next 5 entries (3-hour steps from API)
    for (let i = 0; i < 5; i++) {
      const f = data.list[i];
      const time = new Date(f.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const temp = Math.round(f.main.temp);
      const condition = f.weather[0].main;
      let icon = "☁️";
      if (condition === "Clear") icon = "☀️";
      else if (condition === "Rain") icon = "🌧️";
      else if (condition === "Clouds") icon = "☁️";
      else if (condition === "Snow") icon = "❄️";
      else if (condition === "Thunderstorm") icon = "⛈️";

      // Create forecast block
      const hourDiv = document.createElement("div");
      hourDiv.classList.add("hour");
      hourDiv.innerHTML = `<span>${time}</span><span>${icon}</span><b>${temp}°</b>`;

      miniHourBox.appendChild(hourDiv);
    }
  } catch (err) {
    console.error(err);
  }
}

// Air Quality Function
async function checkAirQuality(lat, lon) {
  try {
    const response = await fetch(
      `${airUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("Air quality data not found");
    const data = await response.json();

    const aqi = data.list[0].main.aqi;  // 1–5 scale
    const pm25 = data.list[0].components.pm2_5;
    const aqiLevels = {
      1: "Good 😊",
      2: "Fair 🙂",
      3: "Moderate 😐",
      4: "Poor 😷",
      5: "Very Poor 🤢"
    };
    document.querySelector(".side-card p").textContent = `PM2.5: ${pm25.toFixed(1)} µg/m³ (${aqiLevels[aqi]})`;
    document.querySelector(".side-card .bar span").style.width = `${Math.min(pm25,100)}%`;

  } catch (err) {
    console.error(err);
    document.querySelector(".side-card p").textContent = "Air quality data unavailable";
  }
}

// ---------------- Current Weather ----------------
async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    topbarCity.innerHTML = `${data.name}, ${data.sys.country} <span class="temp">${Math.round(
      data.main.temp
    )}°C</span>`;

    // Today card
    bigTemp.textContent = Math.round(data.main.temp) + "°";
    desc.textContent = data.weather[0].description;
    facts.innerHTML = `
      <li>Humidity: ${data.main.humidity}%</li>
      <li>Wind: ${data.wind.speed} km/h</li>
      <li>Pressure: ${data.main.pressure} hPa</li>
    `;
    document.querySelector(".coverPhoto").style.backgroundImage = "url('bkg.jpg')";

    // Forecast
    checkForecast(city);
    checkAirQuality(data.coord.lat, data.coord.lon);

  } catch (err) {
    console.error(err);
    alert("City not found!");
  }
}

// ---------------- Events ----------------
searchBtn.addEventListener("click", () => {
  checkWeather(searchInput.value);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkWeather(searchInput.value);
});

// ---------------- Auto-detect location ----------------
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      );
      const data = await response.json();
      checkWeather(data.name);
    });
  }
};
