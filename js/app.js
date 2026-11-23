
/* ==========================================
   MITHU.DEV WEATHER APPLICATION
   Complete JavaScript
========================================== */

/* 1. API CONFIGURATION */
const API_KEY = ""; // API Key পরে বসাবে

const WEATHER_API =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API =
    "https://api.openweathermap.org/data/2.5/forecast";


/* 2. DOM ELEMENTS */
const themeToggle = document.getElementById("themeToggle");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const recentSearches = document.getElementById("recentSearches");
const clearHistory = document.getElementById("clearHistory");
const forecastContainer = document.getElementById("forecastContainer");


/* 3. THEME MANAGEMENT */
function loadTheme() {
    const savedTheme = localStorage.getItem("weatherTheme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("light-mode");
        themeToggle.textContent = "🌙";
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight =
        document.body.classList.contains("light-mode");

    themeToggle.textContent = isLight ? "☀️" : "🌙";

    localStorage.setItem(
        "weatherTheme",
        isLight ? "light" : "dark"
    );
});


/* 4. RECENT SEARCH HISTORY */
function saveRecentSearch(city) {
    let history = JSON.parse(
        localStorage.getItem("recentSearches") || "[]"
    );

    history = history.filter(
        item => item.toLowerCase() !== city.toLowerCase()
    );

    history.unshift(city);
    history = history.slice(0, 5);

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(history)
    );

    displayRecentSearches();
}


function displayRecentSearches() {
    const history = JSON.parse(
        localStorage.getItem("recentSearches") || "[]"
    );

    recentSearches.innerHTML = "";

    if (history.length === 0) {
        const message = document.createElement("p");
        message.className = "text-slate-500 text-sm";
        message.textContent = "No recent searches";

        recentSearches.appendChild(message);
        return;
    }

    history.forEach(city => {
        const button = document.createElement("button");

        button.className =
            "recent-city bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm hover:border-sky-400 transition";

        button.dataset.city = city;
        button.textContent = "📍 " + city;

        recentSearches.appendChild(button);
    });
}


recentSearches.addEventListener("click", event => {
    const button = event.target.closest(".recent-city");

    if (button) {
        cityInput.value = button.dataset.city;
        searchWeather(button.dataset.city);
    }
});


clearHistory.addEventListener("click", () => {
    localStorage.removeItem("recentSearches");
    displayRecentSearches();
});


/* 5. WEATHER ICON */
function getWeatherIcon(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}


/* 6. CURRENT WEATHER */
function displayWeather(data) {
    const weatherCard = document.querySelector(
        "#weatherContent > div:first-child"
    );

    const details = document.querySelectorAll(
        "#weatherContent > div:nth-child(2) h3"
    );

    weatherCard.querySelector("h3").textContent =
        `${data.name}, ${data.sys.country}`;

    const iconContainer = weatherCard.querySelector(".text-7xl");
    iconContainer.innerHTML = "";

    const weatherImage = document.createElement("img");
    weatherImage.src = getWeatherIcon(data.weather[0].icon);
    weatherImage.alt = data.weather[0].description;
    weatherImage.className = "w-24 h-24 mx-auto";

    iconContainer.appendChild(weatherImage);

    weatherCard.querySelector("h2").textContent =
        `${Math.round(data.main.temp)}°C`;

    weatherCard.querySelector("p:last-child").textContent =
        data.weather[0].description;

    details[0].textContent = `${data.main.humidity}%`;

    details[1].textContent =
        `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

    details[2].textContent =
        `${Math.round(data.main.feels_like)}°C`;

    details[3].textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;
}


/* 7. FIVE DAY FORECAST */
function displayForecast(data) {
    const dailyForecast = data.list
        .filter(item => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);

    forecastContainer.innerHTML = "";

    dailyForecast.forEach((day, index) => {
        const date = new Date(day.dt_txt);

        const dayName = date.toLocaleDateString(
            "en-US",
            { weekday: "short" }
        );

        const card = document.createElement("div");

        card.className =
            "bg-slate-800/70 border border-slate-700 rounded-2xl p-5 text-center";

        const dayTitle = document.createElement("p");
        dayTitle.className = "text-slate-400";
        dayTitle.textContent = index === 0 ? "Tomorrow" : dayName;

        const image = document.createElement("img");
        image.src = getWeatherIcon(day.weather[0].icon);
        image.alt = day.weather[0].description;
        image.className = "w-16 h-16 mx-auto my-3";

        const temperature = document.createElement("h3");
        temperature.className = "font-bold text-xl";
        temperature.textContent =
            `${Math.round(day.main.temp)}°C`;

        const description = document.createElement("p");
        description.className =
            "text-slate-400 text-sm mt-2 capitalize";
        description.textContent = day.weather[0].description;

        card.append(
            dayTitle,
            image,
            temperature,
            description
        );

        forecastContainer.appendChild(card);
    });
}


/* 8. SEARCH WEATHER */
async function searchWeather(city) {
    city = city.trim();

    if (!city) {
        alert("Please enter a city name!");
        return;
    }

    if (!API_KEY) {
        alert("Weather API Key is not configured yet!");
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";

    try {
        const weatherResponse = await fetch(
            `${WEATHER_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            throw new Error(
                weatherData.message || "Weather data unavailable!"
            );
        }

        const forecastResponse = await fetch(
            `${FORECAST_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
            throw new Error(
                forecastData.message || "Forecast unavailable!"
            );
        }

        displayWeather(weatherData);
        displayForecast(forecastData);

        saveRecentSearch(weatherData.name);

        console.log("Weather Updated Successfully!");

    } catch (error) {
        console.error("Weather Error:", error);
        alert(error.message || "Something went wrong!");
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}


/* 9. SEARCH BUTTON */
searchBtn.addEventListener("click", () => {
    searchWeather(cityInput.value);
});


/* 10. ENTER KEY SEARCH */
cityInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchWeather(cityInput.value);
    }
});


/* 11. APPLICATION INITIALIZATION */
loadTheme();
displayRecentSearches();

console.log("MITHU.DEV Weather App Initialized!");
