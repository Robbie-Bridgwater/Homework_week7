let APIKey = '157838fc226a31fe1ea09f1f52674ede';
let searchButton = $('.searchButton');
let searchInput = $(".searchInput");

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
        var cityObj = {
            cityName: API_data.name,
            cityTemp: API_data.main.temp,
            cityHumidity: API_data.main.humidity,
            cityWindSpeed: API_data.wind.speed,
            cityWeatherIconName: API_data.weather[0].icon,
            cityCoord: API_data.coord
        }
        dynamicText("windSpeedDiv", cityObj.cityWindSpeed, "Wind Speed (FPM)");
        dynamicText("humidityDiv", cityObj.cityHumidity, "Humidity (RH%)");
        dynamicText("temperatureDiv", cityObj.cityTemp, "Temperature (°C)")
        console.log(cityObj);
        let queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityObj.cityCoord.lat + "&lon=" + cityObj.cityCoord.lon + "&exclude=hourly,daily" + "&appid=" + APIKey;
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
            console.log(fiveDayForecast);
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

// the next task will be to create a for Loop which gets the relevant information for the five day forecast and to make a function that creates the forecast card!