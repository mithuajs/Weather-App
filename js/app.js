
/* ==========================================
   MITHU.DEV WEATHER APPLICATION
   Complete JavaScript - Final Fixed Version
========================================== */


/* 1. API CONFIGURATION */

const API_KEY = "d91e667522fd558427b5839820c92826"; // নিজের OpenWeatherMap API Key বসাবে

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


const locationNotice = document.getElementById("locationNotice");
const locationMessage = document.getElementById("locationMessage");
const openLocationSettings = document.getElementById("openLocationSettings");

let settingsAttempted = false;

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

        message.className = "text-sm";
        message.textContent = "No recent searches";

        recentSearches.appendChild(message);
        return;
    }

    history.forEach(city => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "recent-city";
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
    const icons = {
        "01d": ["☀️", "sun-animation"],
        "01n": ["🌙", "moon-animation"],

        "02d": ["🌤️", "cloud-animation"],
        "02n": ["☁️", "cloud-animation"],

        "03d": ["☁️", "cloud-animation"],
        "03n": ["☁️", "cloud-animation"],

        "04d": ["☁️", "cloud-animation"],
        "04n": ["☁️", "cloud-animation"],

        "09d": ["🌧️", "rain-animation"],
        "09n": ["🌧️", "rain-animation"],

        "10d": ["🌦️", "rain-animation"],
        "10n": ["🌧️", "rain-animation"],

        "11d": ["⛈️", "rain-animation"],
        "11n": ["⛈️", "rain-animation"],

        "13d": ["❄️", "cloud-animation"],
        "13n": ["❄️", "cloud-animation"],

        "50d": ["🌫️", "cloud-animation"],
        "50n": ["🌫️", "cloud-animation"]
    };

    return icons[icon] || ["🌤️", "cloud-animation"];
}


/* 6. CURRENT WEATHER */

function displayWeather(data) {
    const weatherCard = document.querySelector(
        "#weatherContent > div:first-child"
    );

    const details = document.querySelectorAll(
        "#weatherContent > div:nth-child(2) h3"
    );

    const cityName = data.name.toLowerCase().includes("sylhet")
        ? "Sylhet"
        : data.name;

    weatherCard.querySelector("h3").textContent =
        `${cityName}, ${data.sys.country === "BD" ? "Bangladesh" : data.sys.country}`;

    const iconContainer = weatherCard.querySelector(".text-7xl");

    iconContainer.innerHTML = "";

    const weatherIcon = document.createElement("span");

    const [emoji, animationClass] = getWeatherIcon(
        data.weather[0].icon
    );

    weatherIcon.textContent = emoji;
    weatherIcon.className = animationClass;

    weatherIcon.style.display = "inline-block";
    weatherIcon.style.fontSize = "80px";
    weatherIcon.style.lineHeight = "1.3";

    iconContainer.appendChild(weatherIcon);

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
    const dailyData = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];

        if (!dailyData[date]) {
            dailyData[date] = [];
        }

        dailyData[date].push(item);
    });

    const today = new Date().toLocaleDateString("en-CA");

    const forecastDays = Object.keys(dailyData)
        .filter(date => date > today)
        .slice(0, 5);

    forecastContainer.innerHTML = "";

    forecastDays.forEach(date => {
        const items = dailyData[date];

        // Find daytime forecast
        const midday = items.find(item =>
            item.dt_txt.includes("12:00:00")
        ) || items[Math.floor(items.length / 2)];

        // Check rain or thunderstorm
        const rainyPeriod = items.find(item =>
            ["09", "10", "11"].includes(
                item.weather[0].icon.slice(0, 2)
            )
        );

        // Prefer rainy condition if available
        const selectedWeather = rainyPeriod || midday;

        const highTemp = Math.max(
            ...items.map(item => item.main.temp_max)
        );

        const lowTemp = Math.min(
            ...items.map(item => item.main.temp_min)
        );

        const dayName = new Date(
            date + "T12:00:00"
        ).toLocaleDateString("en-US", {
            weekday: "short"
        });

        const card = document.createElement("div");

        card.className =
            "bg-slate-800/70 border border-slate-700 rounded-2xl p-5 text-center";

        // Day name
        const dayTitle = document.createElement("p");

        dayTitle.className = "text-slate-400";
        dayTitle.textContent = dayName;

        // Date
        const dateText = document.createElement("p");

        dateText.className = "text-slate-500 text-xs mt-1";
        dateText.textContent = date;

        // Weather icon with animation
        const icon = document.createElement("div");

        icon.className = "weather-emoji";

        const weatherCode = selectedWeather.weather[0].icon;

        // Use daytime icon for forecast
        const daytimeCode = weatherCode.slice(0, 2) + "d";

        const [emoji, animationClass] = getWeatherIcon(
            daytimeCode
        );

        icon.textContent = emoji;
        icon.classList.add(animationClass);

        // High temperature
        const temperature = document.createElement("h3");

        temperature.className = "font-bold text-xl";
        temperature.textContent =
            `${Math.round(highTemp)}°C`;

        // Low temperature
        const lowTemperature = document.createElement("p");

        lowTemperature.className =
            "text-slate-400 text-sm mt-1";

        lowTemperature.textContent =
            `Low: ${Math.round(lowTemp)}°C`;

        // Weather description
        const description = document.createElement("p");

        description.className =
            "text-slate-400 text-sm mt-2 capitalize";

        description.textContent =
            selectedWeather.weather[0].description;

        // Add elements to card
        card.append(
            dayTitle,
            dateText,
            icon,
            temperature,
            lowTemperature,
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

/* AUTO LOCATION WEATHER */

async function getWeatherByCoordinates(lat, lon) {

    if (!API_KEY) {
        console.error("Weather API Key is missing!");
        return;
    }

    const params =
        `lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
        const [weatherResponse, forecastResponse] =
            await Promise.all([
                fetch(`${WEATHER_API}?${params}`),
                fetch(`${FORECAST_API}?${params}`)
            ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        if (!weatherResponse.ok) {
            throw new Error(weatherData.message);
        }

        if (!forecastResponse.ok) {
            throw new Error(forecastData.message);
        }

        displayWeather(weatherData);
        displayForecast(forecastData);

        console.log("Auto Location Weather Loaded!");

    } catch (error) {
        console.error("Location Weather Error:", error);
    }
}


/* AUTOMATIC GPS ACCESS */

/* AUTOMATIC GPS ACCESS + LOCATION NOTICE */

function showLocationNotice(message) {
    locationNotice.hidden = false;
    locationMessage.textContent = message;
}

function hideLocationNotice() {
    locationNotice.hidden = true;
}

function loadAutoLocation() {

    if (!navigator.geolocation) {
        showLocationNotice(
            "Your browser does not support location access. You can still search for any city."
        );
        return;
    }

    navigator.geolocation.getCurrentPosition(

        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            hideLocationNotice();
            settingsAttempted = false;

            openLocationSettings.textContent = "📍 Turn On Location";

            getWeatherByCoordinates(lat, lon);
        },

        error => {

            if (error.code === 1) {
                showLocationNotice(
                    "Location permission was denied. Allow location access in your browser settings. City Search is still available."
                );

            } else if (error.code === 2) {
                showLocationNotice(
                    "Your device location may be turned off or unavailable. Turn on Location and try again."
                );

            } else if (error.code === 3) {
                showLocationNotice(
                    "Getting your location timed out. Check that Location is turned on and try again."
                );

            } else {
                showLocationNotice(
                    "Unable to access your location. You can still search for any city."
                );
            }

            console.log("Geolocation Error:", error.message);
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}


/* LOCATION SETTINGS BUTTON */

openLocationSettings.addEventListener("click", () => {

    if (settingsAttempted) {
        openLocationSettings.disabled = true;
        openLocationSettings.textContent = "Checking Location...";

        loadAutoLocation();

        setTimeout(() => {
            openLocationSettings.disabled = false;

            if (!locationNotice.hidden) {
                openLocationSettings.textContent = "🔄 Retry Location";
            }
        }, 11000);

        return;
    }

    settingsAttempted = true;

    openLocationSettings.textContent = "🔄 Retry Location";

    showLocationNotice(
        "If Location Settings did not open, swipe down your phone's Quick Settings and turn on Location, or go to Settings → Location. Then return and tap Retry Location."
    );

    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
        window.location.href =
            "intent:#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end";
    }
});

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


