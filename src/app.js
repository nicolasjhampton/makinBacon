'use strict';

/***************************
  express boilerplate
 ***************************/

var express = require('express'),
    bodyParser = require('body-parser'),
    Request = require('request');

var app = express();

app.set('port', (process.env.PORT || 3000));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use('/static', express.static(__dirname + '/public'));

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.json());

/************************
 global variables
 ************************/

// arrays of the actors and movies chosen
var actors = [];
var movies = [];

// decides what input is shown, the actor menu or the movie menu
// this switch has a value of either 'actor' or 'movie'
var input = "";

// our api key for api.themoviedb.org/3/
// do not include in our repo
var apiKey = '';

/***********************
  routes
 ***********************/


// clears all persistent data
var clear = function (request, repsonse, next) {

  actors = [];
  movies = [];
  input = "";
  next();

}


// home is always the last route on the stack
var home = function (request, response){

 // feed the actors, movies, and correct input turn to be rendered
 response.render('layout', {actors:actors, movies:movies, input:input});

};

// postActor is route called after an actor choice has been made
var postActor = function(request, response, next) {

 var actorIDObject = request.body;

 // the next call is passed to the request for timing purposes
 getActor(actorIDObject, response, next);

};

// postMovie is the route called after a movie has been entered
var postMovie = function (request, response, next) {

 var movieIDObject = request.body;
 // the next call is passed to the request for timing purposes
 getMovie(movieIDObject, response, next);

}

// first sets the first actor at the start of the game
var first = function(request, response, next) {

  // generate random numbers to choose a random actor
  var randomActor = Math.floor((Math.random() * 20));
  var randomPage = Math.floor((Math.random() * 100) + 1);

  // set options to call for a random page of twenty popular actors
  var options = {
    url: 'https://api.themoviedb.org/3/person/popular?page=' + randomPage + '&api_key=' + apiKey,
    method: "GET"
  };

  // make call for the random page of actors
  Request(options, function(error, dbResponse, dbbody) {

    // if call was successful
    if (!error && dbResponse.statusCode == 200) {

      // parse response body into usable json object
      var jsonObject = JSON.parse(dbbody);

      // get the random actor from the list of twenty actors
      // note: we must make a second call for the list of movies this actor has been in.
      var chosenActor = jsonObject.results[randomActor];

      // setting options for second, detailed actor call
      options = {
        url: 'https://api.themoviedb.org/3/person/' + chosenActor.id + '?api_key=' + apiKey + '&append_to_response=movie_credits',
        method: "GET"
      };

      // make normal database call for actor info
      getDBInfo(options, next, "actor");

    }
  });
};


/*************************
 route stack
 *************************/

 /*
  *  the way this works is that we always start from our
  *  original get request, which has our first turn router
  *  mounted on it, then each call made goes back and
  *  forth between the post requests
  */

// Route stack taken for beginning a game
app.get('/', [clear, first, home]);

// Route stack taken every time a movie is selected
app.post('/movie', urlencodedParser, [postMovie, home]);

// Route stack taken every time an actor is selected
app.post('/actor', urlencodedParser, [postActor, home]);



/************************
  database callbacks
 ************************/

// Wrapper for the Request callback for a movie
function getMovie (IDObject, response, next) {

  // set the options for the database request
  var options = {
    url: 'http://api.themoviedb.org/3/movie/' + IDObject.movie + '?api_key=' + apiKey + '&append_to_response=credits',
    method: "GET"
  };

  // call the database, create and store the movie, then call the next route
  getDBInfo(options, next, "movie");

};

// Wrapper for the Request callback for an actor
function getActor (IDObject, response, next) {

  // set the options for the database request
  var options = {
    url: 'https://api.themoviedb.org/3/person/' + IDObject.actor + '?api_key=' + apiKey + '&append_to_response=movie_credits',
    method: "GET"
  };

  // call the database, create and store the actor, then call the next route
  getDBInfo(options, next, "actor");

}


function getDBInfo(options, next, infoRequest) {

  // make request with whatever info is in options
  Request(options, function(error, dbResponse, dbbody) {

    // if the request is successful, continue
    if (!error && dbResponse.statusCode == 200) {

      // parse response into json
      var jsonObject = JSON.parse(dbbody);

      // test part one: if we asked for an actor
      if(infoRequest === "actor") {

        // create the actor with complete movie info
        var newActorObject = createActorObject(jsonObject);

        // store this actor into our list of chosen actors to be displayed
        actors.push(newActorObject);

        // set the next input displayed to be the list of movies this actor
        // has appeared in
        input = "movies";

      // test part two: if we asked for a movie
      } else if(infoRequest === "movie") {

        var newMovieObject = createMovieObject(jsonObject);

        // store this movie into our list of chosen movies to be displayed
        movies.push(newMovieObject);

        //set the next input displayed to be the list of actors that appear
        // in this movie
        input = "actors";
      }

      // go to the next route in the stack
      next();
    }
  });
}

/*************************
 helper functions
 *************************/

function createMovieObject(jsonObject) {

  // pull the movie data we need from the response
  var movieTitle = jsonObject.original_title;
  var movieID = jsonObject.id;
  var moviePoster = 'http://image.tmdb.org/t/p/w92' + jsonObject.poster_path;

  // map a new array of cast members with only relevant details
  var movieCast = jsonObject.credits.cast.map(function(obj){
    var actor = {
      name: obj.name,
      id: obj.id
    };
    return actor;
  });

  // make a singular reference for this movie
  var newMovieObject = {
    name: movieTitle,
    id: movieID,
    poster: moviePoster,
    credits: movieCast
  };

  return newMovieObject;

}

function createActorObject(jsonObject) {

  // store details for the chosen actor
  var actorName = jsonObject.name;
  var actorID = jsonObject.id;
  var actorPoster = 'http://image.tmdb.org/t/p/w92' + jsonObject.profile_path


  // map a new array of movies actor has been in with only relevant details
  var actorMovies = jsonObject.movie_credits.cast.map(function(obj){
    var movie = {
      name: obj.original_title,
      id: obj.id
    };
    return movie;
  });

  // make a singular reference object for this actor
  var newActorObject = {
    name: actorName,
    id: actorID,
    poster: actorPoster,
    credits: actorMovies
  };

  return newActorObject;

}

/******************
 port listener
 ******************/

app.listen(app.get('port'), function() {
  console.log('Express is running a Frontend server on port:' + app.get('port'));
});
