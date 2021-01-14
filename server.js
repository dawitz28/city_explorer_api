'use strict';

// let API = 'http://localhost:3000';

// 1st: We bring in our modules/dependencies 


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const pg = require('pg');
const { request } = require('http');
const { response } = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {
  throw err;
});



// routes:
app.get('/', (request, response) => {
  response.status(200).send('hello world');
});

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);

app.get('/add', (request, response) => {
  let city = request.query.city;
  let lon = request.query.longitude;
  let lat = request.query.latitude;
  let formatted = request.formatted_query;
});

// start database
const GEOCODEKEY = process.env.GEOCODEKEY;
let key = process.env.GEOCODEKEY;

//FUNCTIONS
function locationHandler(request, response) {
  let city = request.query.city;
  client.query('SELECT * FROM city08 WHERE search_query=$1', ['search_query'])
    .then(database => {
      if (database.rows.length > 0) {
        console.log(database.rows);
        response.send(database.rows[0]);
      } else {
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        superagent.get(url)
          .then(database => {
            console.log(database.body[0]);
            const locationData = database.body[0];
            const location = new Location(city, locationData);
            client.query(`INSERT INTO city08 (search_query, formatted_query, lon, lat) VALUES ($1, $2, $3, $4);`,
              [location.search_query, location.formatted_query, location.lot, location.log]);
            response.status(200).send(location);
          });
      }
    })
}

function weatherHandler(request, response) {
  const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHER_API_KEY}&lat=${request.query.latitude}&lon=${request.query.longitude}&days=8`
  const lat = request.query.latitude;
  const lon = request.query.longitude;
  console.log(lat, lon);


  superagent.get(url).then(currentWeather => {
    const weatherForcast = currentWeather.body;
    const weatherData = weatherForcast.data.map(currentWeather => new Weather(currentWeather));
    response.send(weatherData);
  });
};


// constructor  
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


app.use('*', (request, response) => {
  response.status(500).send("Sorry, something went wrong");
});


client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Now listening on port, ${PORT}`);
      console.log(`Connected to database ${client.connectionParameters.database}`);
    })
  });

