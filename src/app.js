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
var gameStack = [];

// newGame will let us know that the game has already started
// so we should come into the game in progress without resetting it
var newGame = true;

// Each game started will get a gameNumber ID, which will
// correspond with a socket route and it's storage position in the
// stack of games
var gameNumber = 0;


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


/**************************************
 Open socket routes: Main program here
 **************************************/


/*
 * This is the first socket requested by a player,
 * 'connect' is a native socket.io keyword
 */
io.sockets.on('connect', function(socket) {

  // Clear any old game from the browser, happens when server is restarted to everyone
  newPlayerInit(socket);

  /*
   * 'select game' : This socket receives the game
   * choice at the Beginning of the game
   */
  socket.on('select game', function(data){

    // Once a selection comes back on the gameList socket...
    if(data.gameID === 'newGame') {
      //This only gets called by the first player in a game

      // join a new private game room here
      socket.join(gameNumber.toString());

      // Create a new game and pass the ID to first to start it
      first(socket, createGame(gameNumber));
    } else {
      // ... else move them to the appropriate socket for their selected game
      socket.join(data.gameID.toString());

      // then send them a new update of the current game in progress
      sendStack(socket, data.gameID, true);
    }
  }); // End of 'select game' socket

  /*
   * This 'update' socket is split into rooms for each game
   * we receive new game moves here
   */
  socket.on('update', function(data) {

    console.log('new addition to the stack received ' + data.gameID);
    // we'll receive :{
    //                  gameID: (the gameStack index and room #),
    //                  type: ('movies' or 'actors'),
    //                  id: (id of movie or actor chosen)
    //                }
    // ToDo: add the player who sent the data

    // Test to see if communication was too fast and we need to drop a update
    if(data.type === gameStack[data.gameID].stack[gameStack[data.gameID].stack.length - 1].type) {

      // If we somehow got out of order (meaning the request is the same type
      // as the last item in the stack because two updates came in at the same
      // time) discard request.

    } else {

      // Set the options for the new api request
      var options = getApiOptions(data.type, data.id);

      // call the database, create and store the actor, then emit the update
      getDBInfo(options, socket, data.gameID, data.type, false);

    }
  }); // end of 'update' socket
}); // end of 'connect' socket



/***********************
 Emitters
 ***********************/

/*
 * This is the function we'll use to emit to all players
 * it's built into getDBInfo at the end for timing reasons
 */
var sendStack = function(socket, ID, firstStackEmit) {

  console.log(gameStack[ID].gameID);

  // Emit to all current connected players
  io.sockets.in(ID.toString()).emit('update', {game:gameStack[ID]});

  // if this is a game just created, update everyone's game list
  if(firstStackEmit) {
    io.sockets.emit('gameList', {gameList:createGameList()});
  }

};

/*
 * This communication function is ran when a new browser arrives
 */
var newPlayerInit = function(socket) {

  // Clear any old game in the browser
  socket.emit('update', {game:{}});

  // Log new player. Later we'll create a player near here
  console.log('New player entered');

  // create and emit a current list of games, then wait for selection
  socket.emit('gameList', {gameList:createGameList()});

};



/***********************
 API functions
 ***********************/

/*
 * The 'first' function gets the first actor randomly from themoviedb.org
 */
var first = function(socket, ID) {

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
      // here we added a boolean value of firstStackEmit
      // so if it's the first recevied stack, it goes on the
      // broadcast socket
      getDBInfo(options, socket, ID, 'actors', true);

    }
  });
};

/*
 * This function depends on a options and socket to be passed to it
 * info request is the type of info requested: actors or movies
 */
var getDBInfo = function (options, socket, ID, dataType, firstStackEmit) {

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

        // store this actor into the corresponding game in the gameStack
        gameStack[ID].stack.push(newActorObject);

      // test part two: if we asked for a movie
      } else if(dataType === "movies") {

        // create the movie with complete actor credits info
        var newMovieObject = createMovieObject(jsonObject);

        // store this movie into the corresponding game in the gameStack
        gameStack[ID].stack.push(newMovieObject);

      }
      console.log(ID);
      // emit stack/input data to the gameID route
      sendStack(socket, ID, firstStackEmit);

    }
  });
};

/*************************
  Object functions
 *************************/

 /*
  * This is the function we'll use to create a list of the
  * current games for a player to join
  */
 var createGameList = function() {

   // create a list of games
   var gameList = gameStack.map(function(obj){
     var game = {
       gameID: obj.gameID,
       players: obj.players,
       starting: obj.stack[0].name
     };
     return game;
   });
   console.log(gameList);
   // return game list
   return gameList;

 };

/*
 * This function will create the game object
 * Each player will have and id that corresponds to a
 * incrementing number property in the player object,
 * and the value of that property will be their score.
 * we're also going to start storing the stack inside this
 * object.
 */
var createGame = function (currentGameNumberIndex) {

  // Create a new game w/ ID from the gameNumber index
  var newGameID = currentGameNumberIndex;

  // increment the global gameNumber index
  gameNumber++;

  // create a new game object
  var game = {
    gameID: newGameID,
    players:{0:0},
    actorCount: 0,
    isBacon: false,
    stack:[]
  }

  // We're going to put the game we create at it's location
  // in the game stack that corresponds with it's gameID
  gameStack[newGameID] = game;

  // once we create the game, we're going to increment the
  // gameNumber to give a unique id to the next game,
  // then return the gameID of this game for reference.

  return newGameID;
};


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

};

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

};
