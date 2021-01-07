'use strict';
// let API = 'http://localhost:3000';
// 1st: We bring in our modules/dependencies 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const { request, response } = require('express');

// 2nd: Set up our application
// specify your port
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// routes:
app.get('/', (request, response) => {
  response.status(200).send('hello world');
});
app.get('/weather', weatherHandler);

app.get('/location', (request, response) => {
  // Build our request to tak to locationIQ

  let city = request.query.city;
  let key = process.env.GEOCODEKEY;

  // let GEOCODEKEY = process.env.GEOCODEKEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
  console.log(url); 
  superagent.get(url)
    .then(data => {
      const locationData = data.body[0];
      const location = new Location(city, locationData);
      response.status(200).send(location);
    });

});

// constructor  ??????????????????????????
function Weather(weather) {
  this.forecast = weather.weather.description;
  this.time = weather.valid_date;
};
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
};

function weatherHandler (request, response) {
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  console.log(lat, lon);
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${request.query.latitude}&lon=${request.query.longitude}&days=8`
  superagent.get(url).then(currentWeather => {
    const weatherForcast = currentWeather.body;
    const weatherData = weatherForcast.data.map(currentWeather => new Weather(currentWeather));
    response.send(weatherData);
  });
};

app.listen(PORT, () => 
console.log(`Now listening on port, ${PORT}`));

app.use('*', (request, response) => {
  response.status(500).send("Sorry, something went wrong");
});
