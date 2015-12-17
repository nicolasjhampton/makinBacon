/*************************
 6. Game dynamics
 *************************/
 
/// <reference path="objectFunct.ts" />
/// <reference path="globalVar.ts" />

var createFirstStackObject = function (jsonObject, data) {

  addActorToStack(jsonObject, data);

  return data;

};

var createStackObject = function(jsonObject, data) {

  // test part one: if we asked for an actor
  if(data.type === "actors") {

    addActorToStack(jsonObject, data);

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
/*   End of File  */