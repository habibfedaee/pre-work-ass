document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("searchButton").addEventListener("click", search);
  document
    .getElementById("detailedForecastButton")
    .addEventListener("click", showDetailedForecast);
  document
    .getElementById("clearButton")
    .addEventListener("click", clearResults);
});

// Function to get coordinates from city name
async function getCoordinates(cityName) {
  // console.log("city in getcoordinates: ", cityName);
  try {
    const response = await fetch("data/cities.csv");
    const text = await response.text();
    const rows = text.split("\n").slice(1);

    for (const row of rows) {
      const [city, latitude, longitude] = row.split(",");
      if (city.trim().toLocaleLowerCase() === cityName.trim().toLowerCase()) {
        return {
          lat: parseFloat(latitude),
          lon: parseFloat(longitude),
        };
      }
    }

    console.error(`City '${cityName}' not found in the CSV.`);
    return null;
  } catch (error) {
    console.error("Error fetching city coordinates ", error);
    return null;
  }
}

async function search() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    window.alert("please enter a city name!");
  }
  const coordinates = await getCoordinates(city);
  if (!coordinates) {
    window.alert("city not found");
    console.error("City not found");
    return;
  }

  const { lat, lon } = coordinates; // Extract latitude and longitude

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&hourly=temperature_2m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FLos_Angeles&forecast_days=1`;

  try {
    const response2 = await fetch(url);
    const data2 = await response2.json();
    if (!data2.current) {
      throw new Error("No current weather data available");
    }
    const currentWeather = data2.current;
    const currenWeatherDate = new Date(currentWeather.time);
    const dateString = currenWeatherDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const summaryHTML = ` <p>Date: ${dateString}</p>
    <p>Today's Temperature: ${currentWeather.temperature_2m}°F</p>
    
    `;
    document.getElementById("summary").innerHTML = summaryHTML;
    document.getElementById("detailedForecastButton").disabled = false;
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
  }
}

async function showDetailedForecast() {
  const city = document.getElementById("cityInput").value;

  const coordinates = await getCoordinates(city);

  if (coordinates) {
    try {
      const data = {
        latitude: 37.763283,
        longitude: -122.41286,
        timezone: "America/Los_Angeles",
        current: {
          time: "2024-03-30T13:45",
          temperature_2m: 55.8,
        },
      };

      if (!data.current) {
        throw new Error("No current weather data available");
      }

      // Get the current date and time
      const currentDate = new Date(data.current.time);
      // Get the current temperature
      const currentTemperature = data.current.temperature_2m;

      // Calculate the forecast for the next seven days
      const detailedForecast = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.toLocaleDateString("en-US", {
          weekday: "long",
        });
        const dateString = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const temperature =
          currentTemperature + Math.floor(Math.random() * 10) - 5; // Random variation
        detailedForecast.push({
          day: dayOfWeek,
          date: dateString,
          temperature: temperature.toFixed(1),
        });
      }

      // forecast for each day
      const detailedForecastHTML = detailedForecast
        .map(
          ({ day, date, temperature }) => `
        <div class="forecast-item">
          <div class="forecast-day">${day}</div>
          <div class="forecast-date">${date}</div>
          <div class="forecast-temperature">${temperature}°F</div>
        </div>
      `
        )
        .join("");

      const isIndexPage = window.location.pathname.includes("index.html");

      if (isIndexPage) {
        document.getElementById("detailedForecast").innerHTML =
          detailedForecastHTML;
      } else {
        document.getElementById("detailedForecastForDetailedPage").innerHTML =
          detailedForecastHTML;
      }
    } catch (error) {
      console.error("Error fetching detailed forecast:", error);
    }
  } else {
    console.error("Coordinates not found for the city:", city);
  }
}

// clear results:
async function clearResults() {
  document.getElementById("cityInput").value = "";
  document.getElementById("summary").innerHTML = "";
  document.getElementById("detailedForecast").innerHTML = "";
  document.getElementById("detailedForecastButton").disabled = true;
  document.getElementById("cityInput").focus();
}
