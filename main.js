API_KEY = "16e2602f530dd08bad78c6c0156fba08"; //your api key here

let selectedCityText;
// default city lat and lon to show on the screen first time when loaded
let selectedCity = { lat: 51.5073219, lon: -0.1276474, name: "London" };

let cityName = document.getElementById("city-name");
let mainTemp = document.getElementById("temp-main");
let descriptionMain = document.getElementById("description-main");

let high = document.getElementById("high");
let low = document.getElementById("low");

let timeHourly = document.getElementById("time-hourly");
let iconHourly = document.getElementById("icon-hourly");
let tempHourly = document.getElementById("temp-hourly");
let insideHourlyForecast = document.getElementById(
  "inside-hourly-forecast-div-id"
);

let insideFiveDayForecast = document.querySelector(".inside-five-day-forecast");
let dataListCity = document.getElementById("cities");
let searchInput = document.querySelector("#input-cites");

let feelsLike = document.getElementById("feels-like-h3");
let humidity = document.getElementById("humidity-h3");
let getLocationButton = document.querySelector("#search-button-div > span");

// get [HOURLY] forescast by lat and lon functions return the respone in json format
const getForecast = async ({ lat, lon, name: city }) => {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  ).then((response) => response.json());
  return response;
};

// get [CURRENT WEATHER] forecast data selected city is passed has parameters
let getCurrentWeatherData = async (selectedCity) => {
  try {
    let { lat, lon } = selectedCity;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.log(error, "error fetching weather");
  }
};

//hourlyForecast function get response has parameters and loop thorough the weather data and append it to the houlyInnerHtml tag
const getHourlyForecast = async (response) => {
  //clear the pervious innerHTML section
  insideHourlyForecast.innerHTML = "";
  for (let i = 1; i < 10; i++) {
    //FIRST index will be today date so it termed has now and else will the correct date
    if (i === 1) {
      let hourlyInnerHtml = `
        <section>
        <h4 ">Now</h4>
        <img src=https://openweathermap.org/img/wn/${response.list[i].weather[0].icon}.png>
        <p>${response.list[i].main.temp}</p>
        </section>
        `;
      insideHourlyForecast.innerHTML += hourlyInnerHtml;
    } else {
      //formating the time to 12 hours format
      const date = new Date(response.list[i].dt_txt.toString());
      const options = { hour: "numeric", minute: "2-digit", hour12: true };
      const dateFormated = date.toLocaleTimeString("en-US", options);

      let hourlyInnerHtml = `
      <section>
      <h4 ">${dateFormated}</h4>
      <img src=https://openweathermap.org/img/wn/${response.list[i].weather[0].icon}.png>
      <p>${response.list[i].main.temp}</p>
      </section>
      `;
      insideHourlyForecast.innerHTML += hourlyInnerHtml;
    }
  }
};
// fivedayForecast function
const getFiveDayForecast = (response) => {
  insideFiveDayForecast.innerHTML = "";
  //looping through the response list and traversing by 8 index. 
  // 1-8 index will have todays total weeather and next 8-16 will have tommorrow dates
  for (let i = 1; i <= response.list.length; i += 8) {
    const dateString = response.list[i].dt_txt.toString();
    const date = new Date(dateString);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    //formating to daynames
    const dayName = daysOfWeek[date.getUTCDay()];

    if (i === 1) {
      let dailyForecast = `
      <section>
      <h4 ">Today</h4>
      <img src=https://openweathermap.org/img/wn/${response.list[i].weather[0].icon}.png>
      <p>${response.list[i].main.temp}</p>
      </section>
              `;
      insideFiveDayForecast.innerHTML += dailyForecast;
    } else {
      let dailyForecast = `
              <section>
              <h4 ">${dayName}</h4>
              <img src=https://openweathermap.org/img/wn/${response.list[i].weather[0].icon}.png>
              <p>${response.list[i].main.temp}</p>
              </section>
              `;
      insideFiveDayForecast.innerHTML += dailyForecast;
    }
  }
};
//get weather functions and updating the result to the ui
const getWeather = async (responses) => {
  let {
    name,
    main: { temp },
    main,
    weather: [{ description }],
  } = responses;

  cityName.textContent = name;
  mainTemp.textContent = temp;
  descriptionMain.textContent = description;
  high.textContent = `H: ${main.temp_max}`;
  low.textContent = `L: ${main.temp_min}`;

  feelsLike.textContent = `${main.feels_like} degrees`;
  humidity.textContent = `${main.humidity}%`;
};

//The getGeocities for dataList api function.The response (city) will return the list[5 list beacause limit is 5] of citis lat and longitude 
const getGeoCities = async (searchTextCity) => {
  let city = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${searchTextCity}&limit=5&appid=${API_KEY}`
  );
  return city.json();
};
//debounce function This will only call the api after every 500ms passed. To get datalist data, everytime we press a key
//an api call is triggered. since it is not performance oriented, we are only calling the api after every 500ms
function debounce(func) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, 500);
  };
}

//on change input for addeventlistener this function is called.
const onSearchChange = async (event) => {
  let { value } = event.target;
  if (!value) {
    selectedCity = null;
    selectedCityText = "";
  }

  if (value && selectedCityText !== value) {
    //the list of cites is geting from getGeoCities function.
    let listOfCites = await getGeoCities(value);
    let options = "";

    //looping through the list of cities and setiing the attributes in stringify format
    for (let { lat, lon, name, state, country } of listOfCites) {
      options += `<option data-city-details='${JSON.stringify({
        lat,
        lon,
        name,
      })}' value="${name}, ${state}, ${country}"></option>`;
    }
    document.querySelector("#cities").innerHTML = options;
  }
};

//handle city selection checking for the datalist and puting the selectedCity from options tag of datalist
const handleCitySelection = (event) => {
  selectedCityText = event.target.value;
  let options = document.querySelectorAll("#cities > option");
  if (options?.length) {
    let selectedOption = Array.from(options).find(
      (opt) => opt.value === selectedCityText
    );
    selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));

    loadData();
  }
};
//get Current weather data using geolocation
const loadForecastUsingGeoLocation = () => {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      selectedCity = { lat, lon, name: "kochi" };
      //calling the loadData function is upadate the current new information
      loadData();
    },
    (error) => console.log(error)
  );
};
//loadData will call the required api and update the UI accordingly
const loadData = async () => {
  let response = await getCurrentWeatherData(selectedCity);
  let hourlyForestResponse = await getForecast(selectedCity);

  getWeather(response);
  getHourlyForecast(hourlyForestResponse);
  getFiveDayForecast(hourlyForestResponse);
};

//debouceSearch function called with onSearch and passing event arguments
const debounceSearch = debounce((event) => onSearchChange(event));

//get Geo Location button click handler. When the geo button is clicked the loadForecast function triggered
getLocationButton.addEventListener("click", () => {
  loadForecastUsingGeoLocation();
});

// when domcontentLoaded the search Input events and loadData events are fired
document.addEventListener("DOMContentLoaded", async () => {
  searchInput.addEventListener("input", debounceSearch);
  searchInput.addEventListener("change", handleCitySelection);
  loadData();
});