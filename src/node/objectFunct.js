/*************************
 9. Object functions
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
/*   End of File  */