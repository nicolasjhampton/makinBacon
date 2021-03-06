/*************************
  4. Game Flow functions
 *************************/
 
/// <reference path="server.ts" />
/// <reference path="globalVar.ts" />
/// <reference path="emitters.ts" />
/// <reference path="dynamics.ts" />
/// <reference path="api.ts" />
/// <reference path="random.ts" />
/// <reference path="objectFunct.ts" />


var startNewGame = function (data, socket) {

  // create game 
  var gameID = gamestack.addGame(data);

  // attach needed info to data object
  data['gameID'] = gameID;
  data['type'] = "actors";
  data['firstStackEmit'] = true;

  // join a new private game room here
  socket.join(gameID);

  // Create request for a random page of popular actors
  var getPopularPage = new ApiRequest('popular', random(true));

  // request promise chain
  request(getPopularPage.options)
    .then(JSON.parse)
    .then(getRandomActor)
    .then(request)
    .then(JSON.parse)
    .then(function(response){
      // return gamestack.pushStackCard(response, data);
      return gamestack.getGame(data.gameID).pushCard(response, data);
    })
    .then(sendStack);

};





var joinGameInProgress = function(data, socket) {
  // ... else move them to the appropriate socket for their selected game
  socket.join(data.gameID);

  if(!gamestack.getGame(data.gameID).playerList[data.player]) {
    // Add player to the game
    gamestack.getGame(data.gameID).playerList[data.player] = 0;
  }

  // then send them a new update of the current game in progress
  sendStack(data);
};





var addChoiceAndUpdateGame = function (data) {
  
  // making the variable managable
  var stack = gamestack.getGame(data.gameID).cardStack;

  // Test to see if communication was too fast and we need to drop a update
  if(data.type !== stack[stack.length - 1].type) {

    // Set the options for the new api request
    // var options = getApiOptions(data.type, data.id);
    var apiRequest = new ApiRequest(data.type, data.id);

    request(apiRequest.options)
      .then(JSON.parse)
      .then(function(response){
        // return gamestack.pushStackCard(response, data);
        return gamestack.getGame(data.gameID).pushCard(response, data);
      })
      .then(checkBacon)
      .then(sendStack);

  }
};
/*   End of File  */