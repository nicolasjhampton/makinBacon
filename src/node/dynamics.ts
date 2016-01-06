/*************************
 6. Game dynamics
 *************************/
 
/// <reference path="objectFunct.ts" />
/// <reference path="globalVar.ts" />


var checkBacon = function (data) {

  var ID = data.gameID;
  var player = data.player;
  var currentCardStack = gamestack.getGame(ID).cardStack;

  // Variable to test the credits for bacon
  var baconSearch = currentCardStack[currentCardStack.length - 1].credits;

  //we're going to text if kevin bacon is in this movie
  for(var actor = 0; actor < baconSearch.length; actor++) {

    if(baconSearch[actor].id === 4724) {

      // Increase the actor count
      gamestack.getGame(ID).actorCount += 1;

      // Add the extra Bacon points to the winner's score
      gamestack.getGame(ID).playerList[player] += 100;

      // Push the final bacon to the stack
      gamestack.getGame(ID).cardStack.push(returnBacon(data));

      // set the game to won
      gamestack.getGame(ID).isBacon = true;

      // break the loop
      break;
    }
  }

  return data;

};

var returnBacon = function (data) {
  
 // Winning object of the game
 var jsonObject = {
   name: "Kevin Bacon",
   id: 4724,
   poster: "http://image.tmdb.org/t/p/w92/p1uCaOjxSC1xS5TgmD4uloAkbLd.jpg",
   credits: []
 };
 
 var kevinBacon = new StackCard(jsonObject, data);
 
 return kevinBacon;
};
/*   End of File  */