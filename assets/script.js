let APIKey = '157838fc226a31fe1ea09f1f52674ede';
let searchedCity = 'Birmingham';
let lat = 33.5207;
let lon = -86.8025;

function dynamicText(text, response, string) {
    $("." + text + " ").text(" " + string + " " + response);
}

// Searched city will go as argument below instead of global variable which is being used to test this piece of code.
function getWeatherData() {
    let queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + searchedCity + '&appid=' + APIKey + "&units=metric";
    var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,daily" + "&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then(function(API_data) {
        // you can pass API_data as an argument to an external function. allowing you to reference it like API_data.main.temp
        console.log(API_data);
        let cityObj = {
            cityName: API_data.name,
            cityTemp: API_data.main.temp,
            cityHumidity: API_data.main.humidity,
            cityWindSpeed: API_data.wind.speed,
            cityWeatherIconName: API_data.weather[0].icon
        }
        dynamicText("windSpeedDiv", cityObj.cityWindSpeed, "Wind Speed (FPM)");
        dynamicText("humidityDiv", cityObj.cityHumidity, "Humidity (RH%)");
        dynamicText("temperatureDiv", cityObj.cityTemp, "Temperature (K)")
        console.log(cityObj);
    })
    $.ajax({
        url: queryURL2,
        method: 'GET'
    }).then(function(API_data2) {
        console.log(API_data2);
        let cityUVIndex = API_data2.current.uvi;
        dynamicText("UVDiv", cityUVIndex, "UV (UVI)")
        console.log(cityUVIndex);
    });
};

getWeatherData();