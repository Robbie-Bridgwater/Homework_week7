let APIKey = '157838fc226a31fe1ea09f1f52674ede';
let searchButton = $('.searchButton');
let searchInput = $(".searchInput");
let forecastCardHTML = $(".forecastCard");

function dynamicText(text, response, string) {
    $("." + text + " ").text(" " + string + " " + response);
}

function getWeatherData(searchedCity) {
    let queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + searchedCity + '&appid=' + APIKey + "&units=metric";
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).
    then(function(API_data) {
        console.log(API_data);
        dynamicText("windSpeedDiv", API_data.wind.speed, "Wind Speed (FPM)");
        dynamicText("humidityDiv", API_data.main.humidity, "Humidity (RH%)");
        dynamicText("temperatureDiv", API_data.main.temp, "Temperature (°C)")
        console.log(cityObj);
        let queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + API_data.coord.lat + "&lon=" + API_data.coord.lon + "&exclude=hourly,daily" + "&appid=" + APIKey;
        $.ajax({
            url: queryURL2,
            method: 'GET'
        }).
        then(function(API_data2) {
            console.log(API_data2);
            let cityUVIndex = API_data2.current.uvi;
            dynamicText("UVDiv", cityUVIndex, "UV Index (UVI)")
            console.log(cityUVIndex);
        });
    });

    function getFiveDayForecast() {
        let queryURL3 = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchedCity + "&APPID=" + APIKey + "&units=metric";
        $.ajax({
            url: queryURL3,
            method: 'GET'
        }).
        then(function(fiveDayForecast) {
            console.log("fiveday: ", fiveDayForecast);
            for (var i = 0; i < fiveDayForecast.list.length; i++) {
                if (fiveDayForecast.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    console.log([i]);
                    // The parts below can be shortened massively. Look at week 6 homework and how you made the content dynamically there.
                    let forecastCard = $("<div>", {
                        class: "card",
                    });
                    let forecastDate = $("<h2>", {
                        class: "card-body",
                    })
                    let forecastIcon = $("<img>", {
                        class: "card-body",
                    })
                    let forecastTemp = $("<p>", {
                        class: "card-body",
                    })
                    let forecastHumidity = $("<p>", {
                        class: "card-body",
                    })
                    let forecastUNIX = fiveDayForecast.list[i].dt;
                    forecastDate.append(UNIXconverter(forecastUNIX));
                    forecastCard.append(forecastDate);

                    forecastIcon.attr("src", "https://openweathermap.org/img/w/" + fiveDayForecast.list[i].weather[0].icon + ".png");
                    forecastCard.append(forecastIcon);

                    forecastTemp.text("Temperature (°C) " + fiveDayForecast.list[i].main.temp);
                    forecastCard.append(forecastTemp);

                    forecastHumidity.text("Humidity (RH%) " + fiveDayForecast.list[i].main.humidity);
                    forecastCard.append(forecastHumidity);

                    forecastCardHTML.append(forecastCard);
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
        return;
    }
    getWeatherData(searchInput.val());

});

// The timestamps provided with the fiveday forecast are UNIX timestamps - this converts them to a readable format.
function UNIXconverter(timeStamp) {
    dateConvert = new Date(timeStamp * 1000);
    dateString = dateConvert.toLocaleDateString();
    dateDay = dateConvert.getUTCDay();
    weekArray = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    weekDayAndDateConverted = weekArray[dateDay] + " " + dateString;
    return weekDayAndDateConverted;
}

// the next task will be to set search history into local storage.