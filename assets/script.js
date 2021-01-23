let APIKey = '157838fc226a31fe1ea09f1f52674ede';
let searchButton = $('.searchButton');
let clearButton = $('.clearButton');
let searchInput = $(".searchInput");
let forecastCardHTML = $(".forecastCard");
let searchHistoryDiv = $(".searchHistory");
let forecastRow = $("<div>").addClass("row");
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
renderSearchHistory();
if (searchHistory.length > 0) {
    getWeatherData(searchHistory[searchHistory.length - 1]);
}

function getWeatherData(searchedCity) {
    let queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + searchedCity + '&appid=' + APIKey + "&units=metric";
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).
    then(function(a) {
        console.log(a);
        dynamicText("windSpeedDiv", a.wind.speed, "Wind Speed (FPM)");
        dynamicText("humidityDiv", a.main.humidity, "Humidity (RH%)");
        dynamicText("temperatureDiv", a.main.temp, "Temperature (°C)");
        let queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + a.coord.lat + "&lon=" + a.coord.lon + "&exclude=hourly,daily" + "&appid=" + APIKey;
        $.ajax({
            url: queryURL2,
            method: 'GET'
        }).
        then(function(a2) {
            let cityUVIndex = a2.current.uvi;
            $("#uvBadge").text("UV index: " + cityUVIndex);
            if (cityUVIndex < 3) {
                $("#uvBadge").attr("class", "badge bg-success");
            } else if (cityUVIndex > 3 && cityUVIndex < 7) {
                $("#uvBadge").attr("class", "badge bg-warning text-dark");
            } else {
                $("#uvBadge").attr("class", "badge bg-danger");
            }
        });
    });

    function getFiveDayForecast() {
        forecastRow.empty()
        let queryURL3 = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchedCity + "&APPID=" + APIKey + "&units=metric";
        $.ajax({
            url: queryURL3,
            method: 'GET'
        }).
        then(function(fiveDayForecast) {
            console.log("fiveday: ", fiveDayForecast);
            for (var i = 0; i < fiveDayForecast.list.length; i++) {
                if (fiveDayForecast.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    let forecastCard = $("<div>").addClass("card col");
                    let forecastDate = $("<h2>").addClass("card-body");
                    let forecastIcon = $("<img>").addClass("card-body");
                    let forecastTemp = $("<p>").addClass("card-body");
                    let forecastHumidity = $("<p>").addClass("card-body");

                    let forecastUNIX = fiveDayForecast.list[i].dt;
                    forecastDate.append(UNIXconverter(forecastUNIX));
                    forecastCard.append(forecastDate);

                    forecastIcon.attr("src", "https://openweathermap.org/img/w/" + fiveDayForecast.list[i].weather[0].icon + ".png");
                    forecastCard.append(forecastIcon);

                    forecastTemp.text("Temp (°C) " + fiveDayForecast.list[i].main.temp);
                    forecastCard.append(forecastTemp);

                    forecastHumidity.text("Humidity (RH%) " + fiveDayForecast.list[i].main.humidity);
                    forecastCard.append(forecastHumidity);
                    forecastRow.append(forecastCard);
                    forecastCardHTML.append(forecastRow);
                }
            };
        })
    };
    getFiveDayForecast();
};


searchButton.on("click", function(event) {
    event.preventDefault();
    if (searchInput.val() === "") {
        alert("You must enter a city");
        return
    }
    const searchItem = searchInput.val();
    getWeatherData(searchItem);
    searchHistory.push(searchItem);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
});

clearButton.on("click", function(event) {
    event.preventDefault();
    searchHistory = [];
    renderSearchHistory()
});

$(document).on("click", ".searchHistoryItem", function() {
    let thisElement = $(this);
    getWeatherData(thisElement.text());
})

// The timestamps provided with the fiveday forecast are UNIX timestamps - this converts them to a readable format.
function UNIXconverter(timeStamp) {
    dateConvert = new Date(timeStamp * 1000);
    dateString = dateConvert.toLocaleDateString();
    dateDay = dateConvert.getUTCDay();
    weekArray = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];
    weekDayAndDateConverted = weekArray[dateDay] + " " + dateString;
    return weekDayAndDateConverted;
}

function renderSearchHistory() {
    searchHistoryDiv.empty()
    for (let i = 0; i < searchHistory.length; i++) {
        const searchHistoryItem = $('<p>').addClass("searchHistoryItem p-3 mb-2 bg-light text-dark border border-primary");
        searchHistoryItem.text(searchHistory[i]);
        searchHistoryDiv.prepend(searchHistoryItem);
    }
}

function dynamicText(text, response, string) {
    $("." + text + " ").text(" " + string + " " + response);
}