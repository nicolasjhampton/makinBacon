'use strict';

/**********************************
 express http/socket.io boilerplate
 **********************************/

// Starting our http/socket.io server
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

var request = require('request-promise');

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


/**************************************
 Open socket routes: Main program here
 **************************************/

io.sockets.on('connect', function(socket) {


  socket.on('adduser', function(data){
    // Clear any old game from the browser, happens when server is restarted to everyone
    // for the first game, the starting actor is going to be null, thus the or pipe in createGameList
    newPlayerInit(socket, data);

  });

  socket.on('select game', function(data){

    console.log('selection received');

    if(data.gameID === 'newGame') { //called by the first player in game

      startNewGame(data, socket);

    } else {

      joinGameInProgress(data, socket);

    }

  }); // end of 'select game' socket

  socket.on('update', function(data) {

    console.log('new addition to the stack received ' + data.gameID);

    addChoiceAndUpdateGame(data);

  }); // end of 'update' socket

  socket.on('leaveroom', function(data){

    socket.leave(data.ID);

  }); // end of 'leaveroom' socket

}); // end of 'connect' socket


/*************************
  Game Flow functions
 *************************/


var startNewGame = function (data, socket) {

  // create game and attach needed info to data object
  data['gameID'] = createGame(data.player);
  data['type'] = "actors";
  data['firstStackEmit'] = true;


  // join a new private game room here
  socket.join(data.gameID);

  // Create request for a random page of popular actors
  var getPopularPage = getApiOptions('popular', random(true));

  // request promise chain
  request(getPopularPage)
    .then(JSON.parse)
    .then(getRandomActor)
    .then(request)
    .then(JSON.parse)
    .then(function(response){
      return createFirstStackObject(response, data);
    })
    .then(sendStack);

};

var joinGameInProgress = function(data, socket) {
  // ... else move them to the appropriate socket for their selected game
  socket.join(data.gameID);

  if(!gameStack[data.gameID].playerList[data.player]) {
    // Add player to the game
    gameStack[data.gameID].playerList[data.player] = 0;
  }

  // then send them a new update of the current game in progress
  sendStack(data);
};

var addChoiceAndUpdateGame = function (data) {
  // making the variable managable
  var stack = gameStack[data.gameID].stack;

  // Test to see if communication was too fast and we need to drop a update
  if(data.type !== stack[stack.length - 1].type) {

    // Set the options for the new api request
    var options = getApiOptions(data.type, data.id);

    request(options)
      .then(JSON.parse)
      .then(function(response){
        return createStackObject(response, data);
      })
      .then(checkBacon)
      .then(sendStack);

  }
};


/***********************
 Emitters
 ***********************/

/*
 * This communication function is ran when a new browser arrives
 * ToDo: create a database of players
 */
var newPlayerInit = function(socket, data) {

  // stores the player name under the list of usernames active
  socket.username = data.username;

  socket.emit('init', {game:{} ,gameList:createGameList(), username:socket.username});

  // Clear any old game in the browser, give username
  //socket.emit('update', {game:{}, username:socket.username});

  // create and emit a current list of games, then wait for selection
  //socket.emit('gameList', {gameList:createGameList()});

};


/*
 * This is the function we'll use to emit to all players
 * it's built into getDBInfo at the end for timing reasons
 */
var sendStack = function(data) {

  // Emit the game to it's assigned room
  io.sockets.in(data.gameID).emit('update', {game:gameStack[data.gameID]});

  // Update the gamelist for all players and rooms
  io.sockets.emit('gameList', {gameList:createGameList()});

  // remove this game if the game was won/lost
  if(gameStack[data.gameID].actorCount === 7 || gameStack[data.gameID].isBacon === true) {
    removeGame(data.gameID);
  }

};


var removeGame = function(ID) {

 gameStack[ID].stack = [{name:'Game Over'}];
 gameStack[ID].players = {deadGame:'Game Over'};
 gameStack[ID].isBacon = true;

 // Send out a roomwide leaveroom event, so that all sockets come back and
 // leave the room
 io.sockets.in(ID).emit('leaveroom');

 // Send revised game list
 io.sockets.emit('gameList', {gameList:createGameList()});

};

/*************************
  Game dynamics
 *************************/

var createFirstStackObject = function (jsonObject, data) {

  addActorToStack(jsonObject, data);

  return data;

};

var createStackObject = function(jsonObject, data) {

  // test part one: if we asked for an actor
  if(data.type === "actors") {

    addActorToStack(jsonObject, data, false);

  // test part two: if we asked for a movie
  } else if(data.type === "movies") { // This is a movie, and thus a game in progress

    addMovieToStack(jsonObject, data);

  } //end if(data.type is movies or actors)

  return data;

};

var addActorToStack = function(jsonObject, data) {

  // If this is the first actor, points and credit go to no one
  var newActorObject = createActorObject(jsonObject, data);

  if(data.firstStackEmit !== true) { // If this is a new game

    // Points rule ****
    // add the 100 points to the score for that player
    gameStack[data.gameID].playerList[data.player] += 100;

  }

  // Game rule ****
  // Incrementing the actor count
  gameStack[data.gameID].actorCount += 1;

  // store this actor into the corresponding game in the gameStack
  gameStack[data.gameID].stack.push(newActorObject);

};

var addMovieToStack = function(jsonObject, data) {

    // create the movie with complete actor credits info
    var newMovieObject = createMovieObject(jsonObject, data);

    // Points rule ****
    // add the 100 points to the score for that player
    gameStack[data.gameID].playerList[data.player] += 100;

    // store this movie into the corresponding game in the gameStack
    gameStack[data.gameID].stack.push(newMovieObject);

};


var checkBacon = function (data) {

  var ID = data.gameID;
  var player = data.player;

  // Variable to test the credits for bacon
  var baconSearch = gameStack[ID].stack[gameStack[ID].stack.length - 1].credits;

  //we're going to text if kevin bacon is in this movie
  for(var actor = 0; actor < baconSearch.length; actor++) {

    if(baconSearch[actor].id === 4724) {

      // Increase the actor count
      gameStack[ID].actorCount += 1;

      // Add the extra Bacon points to the winner's score
      gameStack[ID].playerList[player] += 100;

      // Push the final bacon to the stack
      gameStack[ID].stack.push(returnBacon(data));

      // set the game to won
      gameStack[ID].isBacon = true;

      // break the loop
      break;
    }
  }

  return data;

};

var returnBacon = function (data) {

 // Winning object of the game
 var kevinBacon = {
   gameID: data.gameID,
   player:data.player,
   type: "actors",
   name: "Kevin Bacon",
   id: 4724,
   poster: "http://image.tmdb.org/t/p/w92/p1uCaOjxSC1xS5TgmD4uloAkbLd.jpg",
   credits: []
 };

 return kevinBacon;
};


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
  randomizer functions
 ***********************/

 var random = function (type) {

   if(type) {
     // true is for page
     return Math.floor((Math.random() * 100) + 1);
   } else {
     // false is for actor
     return Math.floor((Math.random() * 20));
   }

 };

 var getRandomActor = function (pageJSONObject) {

   var chosenActor = pageJSONObject.results[random(false)];

   return getApiOptions('actors', chosenActor.id);

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
     playerList: obj.playerList,
     starting: obj.stack[0].name || null
   };
   return game;
 });

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
var createGame = function (startingPlayer) {

  // Create a new game w/ ID from the gameNumber index
  var newGameID = gameNumber;

  // increment the global gameNumber index
  gameNumber++;

  // Create an object that has usernames for each key and
  // a score for each value
  var players = {};
  players[startingPlayer] = 0;

  // create a new game object
  var game = {
    gameID: newGameID,
    playerList:players,
    actorCount: 0,
    isBacon: false,
    stack:[]
  }

  // We're going to put the game we create at it's location
  // in the game stack that corresponds with it's gameID
  gameStack[newGameID] = game;

  return newGameID;

};


/*
 * These functions create the stack objects we'll emit back to the clients
 */

// creates a movie stack object
var createMovieObject = function(jsonObject, data) {

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
    gameID: data.gameID,
    player: data.player,
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
var createActorObject = function(jsonObject, data) {

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
    gameID: data.gameID,
    player: data.firstStackEmit ? "start" : data.player,
    type: "actors",
    name: actorName,
    id: actorID,
    poster: actorPoster,
    credits: actorMovies
  };

  // return created object
  return newActorObject;

};
