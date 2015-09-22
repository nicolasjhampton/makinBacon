'use strict';

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

var actors;
var movies = [];
var actorsChosen = [];
var first;

/***********************
  routes
 ***********************/

 // first sets the start of the game

var first = function(request, response, next) {

  first = true;
  next();

};

// home is always the last route on the stack

var home = function (request, response){

  response.render('layout', {actors:actors, movies:movies, actorsChosen:actorsChosen});

};

// postActor is route called after an actor choice has been made

var postActor = function(request, response, next) {

  if(typeof request.body.actor !== 'undefined') {
    actorsChosen.push(request.body.actor);
  }

  next();

};

// postMovie is the route called after a movie has been entered

var postMovie = function (request, response, next) {

  if(request.body.movie !== "") {

    // the next call is passed to the request for timing purposes
    getMovie(request.body.movie, response, next);

  } else {

    next();

  }

}

/*************************
 helper functions
 *************************/

function addMovie (title, img, movieActors) {
  // add the movie to our display
  movies.push({
    "movieTitle": title,
    "movieImg": img
  });

  // update out list of actors choices
  actors = movieActors;
}

function checkActor (movieActors, actorChoice) {

  //set our test equal to false to start
  var match = false;
  console.log(movieActors);
  // go through all the actors in the movie
  for(var actor in movieActors) {
    console.log(actorChoice + " " + movieActors[actor]);
    // if any actor matches the choice, set match to true
    if (actorChoice + "" == movieActors[actor] + "") {

      match = true;
    }
  }
  console.log("made it");
  // return boolean result of test
  return match;
}


/************************
  database callbacks
 ************************/

function getMovie (body, response, next) {

  // set the options for the database request
  var options = {
    url: 'http://www.omdbapi.com/?t=' + body + '&r=json',
    method: "GET",
  };

  // make the request to the movie database
  Request(options, function(error, dbResponse, dbbody) {

    // check for successful response
    if (!error && dbResponse.statusCode == 200) {

      // turn the string response into valid json
      var movieObject = JSON.parse(dbbody);

      // store the actor list from the response
      var movieActors = movieObject.Actors.split(", ");

      // pull the movie data we need from the response
      var movieTitle = movieObject.Title;
      var movieImg = movieObject.Poster;

      // if this is the second round or later
      if(first !== true) {

        // check to see if the last actor is in the chosen movie
        // checkActor is in our gameLogic.js file

        if(checkActor(movieActors, actorsChosen[actorsChosen.length - 1])) {

          // if so, add the movie to our display
          addMovie(movieTitle, movieImg, movieActors);

        } else {

          // else, display actor not a match to movie message

        }

      } else {

        first = false;
        // if this is the first round, just add the movie
        addMovie(movieTitle, movieImg, movieActors);

      }
    }

    // got to the next router in the stack
    next();
  });
};

/*************************
 route stack
 *************************/

app.get('/', [first, home]);

app.post('/movie', urlencodedParser, [postMovie, home]);

app.post('/actor', urlencodedParser, [postActor, home]);


app.listen(app.get('port'), function() {
  console.log('Express is running a Frontend server on port:' + app.get('port'));
});
