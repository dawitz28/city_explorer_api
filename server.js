'use strict';
// let API = 'http://localhost:3000';

// 1st: We bring in our modules/dependencies 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const { request, response } = require('express');
const superagent = require('superagent');
const { request, response } = require('express');

// 2nd: Set up our application
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());



// Start the server.

// routes:
app.get('/', (request, response) => {
response.status(200).send('hello world');
});
app.get('/location', (request, response) =>{
let city = request.query.city;
// let key = process.env.GEOCODE_API_KEY;
// API KEY NOT SAVED IN ENV FILE YET 
});


// Function Handlers:
function locationHandler(request, response) {
  const location = require('./data/location.json');
  const city = request.query.city;
  const locationData = new Location(city, location);

  response.send(locationData);
}
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

app.get('/weather', (request, response) => {
  const weather = require('./data/weather.json');
  const weatherArr = [];
  weather.data.forEach(weather => {
    weatherArr.push(new Weather(weather));
  });
  response.send(weatherArr);
});

// constructor
function Weather(weather) {
  this.forecast = weather.weather.description;
  this.time = weather.valid_date;
  
}

app.use('*', (request, response) => {
  response.status(500).send("Sorry, something went wrong");
});
app.listen(PORT, () => {
  console.log(`Now listening on port, ${PORT}`);
});