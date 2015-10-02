'use strict';

/**********************************
 express http/socket.io boilerplate
 **********************************/

// Starting our http/socket.io server
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

// module needed to make get requests from the server
var Request = require('request');

// Openshift adaptive enviornment variables
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

// set port for our express instance
app.set('port', server_port);

// define public folder to serve static files
app.use(express.static(__dirname + '/public'));

// Set the sever to listen for get requests
server.listen(app.get('port'), server_ip_address, function () {
   console.log("Listening at " + server_ip_address + " on port " + app.get('port'));
});

/************************
 global variables
 ************************/

// arrays of the actors and movies chosen (note: combined into stack)
var stack = [];

// newGame will let us know that the game has already started
// so we should come into the game in progress without resetting it
var newGame = true;


/************************
 themoviedb api variables
 ************************/

/*
 * All the variables for the movie database are factored out
 * and self-contained in this switch function, for easy update.
 */
var getApiOptions = function (optionsRequest, idOrPage) {

  // our api key for api.themoviedb.org/3/
  // Go get your own!
  var apiKey = '';

  // Beginning Url for all api requests, using version 3 of api
  var apiUrl = 'https://api.themoviedb.org/3/';

  // Beginning Url for all pictures from api
  var posterUrl = 'http://image.tmdb.org/t/p/w92';

  // If we get no image we'll send a generic question mark image from wikipedia
  var unknownImg = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_(black_on_white).png';

  switch(optionsRequest) {

    case 'popular':
       return {
                url: apiUrl + 'person/popular?page=' + idOrPage + '&api_key=' + apiKey,
                method: "GET"
              };
       break;

    case 'actors':
       return {
                url: apiUrl + 'person/' + idOrPage + '?api_key=' + apiKey + '&append_to_response=movie_credits',
                method: "GET"
              };
       break;

    case 'movies':
       return {
                url: apiUrl + 'movie/' + idOrPage + '?api_key=' + apiKey + '&append_to_response=credits',
                method: "GET"
              };
       break;

    case 'poster':
       if(idOrPage !== null) {

         return posterUrl + idOrPage;

       } else {

         return unknownImg;

       }
       break;
  }
};


/***********************
 sockets
 **********************/


/*
 * This is the first socket requested by a player,
 * 'connect' is a native socket.io keyword
 */
io.sockets.on('connect', function(socket) {

  console.log('request for start game data');

  // check to see if a game is already in progress
  if(newGame === true) {

    // First is ran, and by the end we've used sendStack to emit the
    // first actor
    first(socket);

  } else {

    // if this isn't the first person in this game, then skip to
    // the next route in the stack quietly
    sendStack(socket);

  } // end of newGame test

  // After the first 'connect' communication is received,
  // a reply is sent on update, and all sockets are listening
  // and sending on 'update'.
  socket.on('update', function(data) {

    console.log('new addition to the stack received' + data);

    var options = getApiOptions(data.type, data.id); //testData(data);

    // call the database, create and store the actor, then call the update socket emit
    getDBInfo(options, socket, data.type);

  }); // end of 'update' socket
}); // end of 'connect' socket


/*
 * This is the function we'll use to emit to all players
 * it's built into getDBInfo at the end for timing reasons
 */
var sendStack = function(socket) {

  // Set eventName to the 'update' socket
  var eventName = 'update';

  // Emit to all current connected players
  io.sockets.emit(eventName, {stack:stack});

};



/***********************
 API functions
 ***********************/

/*
 * The 'first' function gets the first actor randomly from themoviedb.org
 */

var first = function(socket) {

  // if this is the first person in the game, set newGame to false
  // and continue to get a random actor to start the game
  newGame = false;

  // generate random numbers to choose a random actor
  var randomActor = Math.floor((Math.random() * 20));
  var randomPage = Math.floor((Math.random() * 100) + 1);

  // set options to call for a random page of twenty popular actors
  // Note: See 'themoviedb api variables' section for contents
  var options = getApiOptions('popular', randomPage);

  // make call for the random page of actors
  Request(options, function(error, dbResponse, dbbody) {

    // if call was successful
    if (!error && dbResponse.statusCode == 200) {

      // parse response body into usable json object
      var jsonObject = JSON.parse(dbbody);

      // get the random actor from the list of twenty actors
      // Note: we must make a second call for the list of movies this actor has been in.
      var chosenActor = jsonObject.results[randomActor];

      // setting options for second, detailed actor call
      // Note: See 'themoviedb api variables' section for contents
      options = getApiOptions('actors', chosenActor.id);

      // make normal database call for first actor's info
      getDBInfo(options, socket, 'actors');

    }
  });
};

/*
 * This function depends on a options and socket to be passed to it
 * info request is the type of info requested: actors or movies
 */
var getDBInfo = function (options, socket, dataType) {

  // make request with whatever info is in options
  Request(options, function(error, dbResponse, dbbody) {

    // if the request is successful, continue
    if (!error && dbResponse.statusCode == 200) {

      // parse response into json
      var jsonObject = JSON.parse(dbbody);

      // test part one: if we asked for an actor
      if(dataType === "actors") {

        // create the actor with complete movie credits info
        var newActorObject = createActorObject(jsonObject);

        // store this actor into our list of chosen actors to be displayed
        stack.push(newActorObject);

      // test part two: if we asked for a movie
      } else if(dataType === "movies") {

        // create the movie with complete actor credits info
        var newMovieObject = createMovieObject(jsonObject);

        // store this movie into our list of chosen movies to be displayed
        stack.push(newMovieObject);

      }

      // emit stack/input data
      sendStack(socket);

    }
  });
};

/*************************
 helper functions
 *************************/

/*
 * These functions create the stack objects we'll emit back to the clients
 */

// creates a movie stack object
var createMovieObject = function(jsonObject) {

  // pull the movie data we need from the response
  var movieTitle = jsonObject.original_title;
  var movieID = jsonObject.id;

  // We're creating the filepath for our poster here
  // Note: See 'themoviedb api variables' section for contents
  var moviePoster = getApiOptions('poster', jsonObject.poster_path);

  // map a new array of cast members with only relevant details
  var movieCast = jsonObject.credits.cast.map(function(obj){
    var actor = {
      type: "actors",
      name: obj.name,
      id: obj.id
    };
    return actor;
  });

  // make a singular reference for this movie
  var newMovieObject = {
    type: "movies",
    name: movieTitle,
    id: movieID,
    poster: moviePoster,
    credits: movieCast
  };

  // return created object
  return newMovieObject;

}

// Creates an actor stack object
var createActorObject = function(jsonObject) {

  // store details for the chosen actor
  var actorName = jsonObject.name;
  var actorID = jsonObject.id;

  // We're creating the filepath for our poster here
  // Note: See 'themoviedb api variables' section for contents

  var actorPoster = getApiOptions('poster', jsonObject.profile_path);


  // map a new array of movies actor has been in with only relevant details
  var actorMovies = jsonObject.movie_credits.cast.map(function(obj){
    var movie = {
      type: "movies",
      name: obj.original_title,
      id: obj.id
    };
    return movie;
  });

  // make a singular reference object for this actor
  var newActorObject = {
    type: "actors",
    name: actorName,
    id: actorID,
    poster: actorPoster,
    credits: actorMovies
  };

  // return created object
  return newActorObject;

}
