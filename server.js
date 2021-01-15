'use strict';

// let API = 'http://localhost:3000';

// 1st: We bring in our modules/dependencies 


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
// const { request } = require('http');
// const { response } = require('express');

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
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);

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
  client.query('SELECT * FROM city08 WHERE search_query=$1', [city])
    .then(database => {
      if (database.rows.length > 0) {
        console.log('pulling from database',database.rows);
        response.send(database.rows[0]);
      } else {
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        superagent.get(url)
          .then(database => {
            console.log('not in the database', database.body[0]);
            const locationData = database.body[0];
            const location = new Location(city, locationData);
            client.query(`INSERT INTO city08 (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`,
              [location.search_query, location.formatted_query, location.latitude, location.longitude]);
            response.status(200).send(location);
          }).catch(E => console.log(E));
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
}

function moviesHandler(request, response) {
  const city = request.query.search_query;
  console.log(city, 'this is the city');
  const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${request.query.search_query}`
  superagent.get(url).then(newMovies => {
    console.log(newMovies, 'the latest movie');
    // const movies = newMovies.body;
    // console.log(moviesInfo);
    const moviesData = newMovies.body.results.map(movies => new Movies(movies));
    response.send(moviesData);

  });
}

function yelpHandler(request, response) {
  const numberperpage = 5
  const page = request.query.page || 1;
  const start = ((page - 1) * numberperpage + 1);
  const YELPAPIKEY = process.env.YELP_API_KEY;
  console.log(YELPAPIKEY);
  const city = request.query.search_query;
  console.log(city);
  const url = `https://api.yelp.com/v3/businesses/search?&location=${request.query.search_query}&term="resturant"`;

  const quaryparams = {
    limit: numberperpage,
    offset: start
  };
  return superagent.get(url)
    .set('Authorization', `Bearer ${YELPAPIKEY}`)
    .query(quaryparams)

    .then(getBusinessData => {
      const yelpData = getBusinessData.body.businesses;
      // console.log(yelpData);
      const newData = yelpData.map(getBusinessData => new Yelp (getBusinessData));
      response.send(newData);
    }).catch(error => console.log(error));

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

function Movies(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.average_votes;
  this.total_votes = movie.total_votes;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.released_on;
}

function Yelp(yelpData){
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
}

app.use('*', (request, response) => {
  response.status(500).send("Sorry, something went wrong");
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Now listening on port, ${PORT}`);
      // console.log(`Connected to database ${client.connectionParameters.database}`);
    })
  });

