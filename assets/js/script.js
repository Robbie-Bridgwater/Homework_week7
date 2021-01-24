// <--- VARIABLES --->
const API_KEY = '157838fc226a31fe1ea09f1f52674ede';
const SEARCH_BUTTON = $('.searchButton');
const CLEAR_BUTTON = $('.clearButton');
const SEARCH_INPUT = $('.searchInput');
const FORECAST_CARD_HTML = $('.forecastCard');
const SEARCH_HISTORY_DIV = $('.searchHistory ');
const CITY_NAME_DIV = $(".cityNameDiv");
const FORECAST_ROW = $("<div>").addClass("row");
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];


// This calls the renderSearchHistory function so that when the page is refreshed the search history is also rendered.
renderSearchHistory();
// This initiliases an if statement. 
// If the searchHistory array is greater than 0, then call the getWeatherData function with the last item searched as an argument.
if (searchHistory.length > 0) {
    getWeatherData(searchHistory[searchHistory.length - 1]);
}

// <--- FUNCTIONS --->

// The timestamps that come from the fiveday forecast are UNIX timestamps - this function converts them to a more ledgeable format. (like camann' I'm not a human calculator, gimme days).
function UNIXconverter(timeStamp) {
    dateConvert = new Date(timeStamp * 1000);
    dateString = dateConvert.toLocaleDateString();
    dateDay = dateConvert.getUTCDay();
    weekArray = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
    weekDayAndDateConverted = weekArray[dateDay] + " " + dateString;
    return weekDayAndDateConverted;
}

// This function renders the search history. It uses a for loop to create p elements from the searchHistory array in local storage. It also adds bootstrap components (for added fanciness n' class). Empting the div is important before the loop as otherwise the loop will stack the array on top of itself (remove if you want to see what I mean).
function renderSearchHistory() {
    SEARCH_HISTORY_DIV.empty()
    for (let i = 0; i < searchHistory.length; i++) {
        const searchHistoryItem = $('<p>').addClass("searchHistoryItem p-3 mb-2 bg-light text-dark border border-primary");
        searchHistoryItem.text(searchHistory[i]);
        SEARCH_HISTORY_DIV.prepend(searchHistoryItem);
    }
}

// This function uses javascript to construct the current date formatted as dd/mm/yyyy.
function currentDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    let NOW = dd + '/' + mm + '/' + yyyy;
    return NOW;
}

// This function creates the UV index badge. It's scale is roughly based of the EPA's recommendation. (below 3 is safe, between 3 and 7 is okay but not optimal, above 7 and you should definitely wack on that sunscreen).
function badgeComponent(cityUVIndex) {
    $("#uvBadge").text("UV index: " + cityUVIndex);
    if (cityUVIndex < 3) {
        $("#uvBadge").addClass("badge bg-success");
    } else if (cityUVIndex > 3 && cityUVIndex < 7) {
        $("#uvBadge").addClass("badge bg-warning text-dark");
    } else {
        $("#uvBadge").addClass("badge bg-danger");
    }
}

// <--- MAIN --->

// This is the main function. It retrieves and manipulates data from the openweathermap API.
function getWeatherData(searchedCity) {
    let queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + searchedCity + '&appid=' + API_KEY + "&units=metric";
    $.ajax({
            url: queryURL,
            method: 'GET'
        }).
        // I use "a" as an abbreviation for API-call.
    then(function(a) {
        console.log(a);
        CITY_NAME_DIV.text(a.name + " " + currentDate());
        // I replace the relevant divs with the (i) wind speed; (ii) humidity; (iii) and temperature data retrieved from the API 
        $(".windSpeedDiv").text("Wind Speed (FPM) " + a.wind.speed);
        $(".humidityDiv").text("Humidity (RH%) " + a.main.humidity);
        $(".temperatureDiv").text("Temperature (°C) " + a.main.temp);
        // I needed to use a second call to retrieve the UVI data, as this data isn't within the first API.
        let queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + a.coord.lat + "&lon=" + a.coord.lon + "&exclude=hourly,daily" + "&appid=" + API_KEY;
        $.ajax({
            url: queryURL2,
            method: 'GET'
        }).
        then(function(a2) {
            console.log("A2" + a2);
            let cityUVIndex = a2.current.uvi;
            badgeComponent(cityUVIndex)
        });
    });
    // I needed to use a third call to retrieve the five day forecast data.
    function getFiveDayForecast() {
        FORECAST_ROW.empty()
        let queryURL3 = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchedCity + "&APPID=" + API_KEY + "&units=metric";
        $.ajax({
            url: queryURL3,
            method: 'GET'
        }).
        then(function(fiveDayForecast) {
            console.log("fiveday: ", fiveDayForecast);
            for (var i = 0; i < fiveDayForecast.list.length; i++) {
                // This dynamically creates the content for the five day forecast. It checks for the index of 15:00:00 in the API response. Since data sampling in this api is done every 3 hours over a 5 day period it will only choose samples that have been done at 3 o'clock.
                if (fiveDayForecast.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    let forecastCard = $("<div>").addClass("card col");
                    let forecastDate = $("<h2>").addClass("card-body");
                    let forecastIcon = $("<img>").addClass("card-body");
                    let forecastTemp = $("<p>").addClass("card-body");
                    let forecastHumidity = $("<p>").addClass("card-body");
                    // This retrieves the Unix timestamp, coverts it into a data and appends it to the forecast card.
                    let forecastUNIX = fiveDayForecast.list[i].dt;
                    forecastDate.append(UNIXconverter(forecastUNIX));
                    forecastCard.append(forecastDate);
                    // This retrieves the weather icon and appends it to the forecast card.
                    forecastIcon.attr("src", "https://openweathermap.org/img/w/" + fiveDayForecast.list[i].weather[0].icon + ".png");
                    forecastCard.append(forecastIcon);
                    // This retrieves the temperature and appends it to the forecast card
                    forecastTemp.text("Temp (°C) " + fiveDayForecast.list[i].main.temp);
                    forecastCard.append(forecastTemp);
                    // This retrieves the humidity and appends it to the forecast card
                    forecastHumidity.text("Humidity (RH%) " + fiveDayForecast.list[i].main.humidity);
                    forecastCard.append(forecastHumidity);
                    // This appends the forecast cards (which are columns using bootstrap classes as seen on line 106) to the forecast row.
                    FORECAST_ROW.append(forecastCard);
                    // This appends the row to the HTML div to be displayed.
                    FORECAST_CARD_HTML.append(FORECAST_ROW);
                }
            };
        })
    };
    getFiveDayForecast();
}

// <--- EVENT LISTENERS --->

// This creates the event listener for the search button.
SEARCH_BUTTON.on("click", function(event) {
    event.preventDefault();
    if (SEARCH_INPUT.val() === "") {
        // This alerts the user that they must enter a city if they try to search nothing
        alert("You must enter a city");
        return
    }
    // else... it calls the weatherDataFunction with what they have searched as input. It pushes what they have searched to local storage. It calls the renderSearchHistory function which creates the search history under the search input.
    const searchItem = SEARCH_INPUT.val();
    getWeatherData(searchItem);
    searchHistory.push(searchItem);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
})

// This creates the event listener for the clear history button.
CLEAR_BUTTON.on("click", function(event) {
    event.preventDefault();
    searchHistory = [];
    renderSearchHistory()
})

// This creates the event listener for the search history items. When you click on them it will call the getweather data function with whatever search history item you have clicked on.
$(".searchHistoryItem").on("click", function() {
    getWeatherData($(this).text());
})