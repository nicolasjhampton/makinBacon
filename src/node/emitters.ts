/***********************
 5. Emitters
 ***********************/

/// <reference path="server.ts" />
/// <reference path="globalVar.ts" />
/// <reference path="objectFunct.ts" />

/*
 * This communication function is ran when a new browser arrives
 * ToDo: create a database of players
 */
var newPlayerInit = function(socket, data) {

  // stores the player name under the list of usernames active
  socket.username = data.username;

  socket.emit('init', {game:{} ,gameList:gamestack.getGamelist(), username:socket.username});

};


/*
 * This is the function we'll use to emit to all players
 * it's built into getDBInfo at the end for timing reasons
 */
var sendStack = function(data) {
  console.log(gamestack.getGame(data.gameID));
  // Emit the game to it's assigned room
  io.sockets.in(data.gameID).emit('update', {game:gamestack.getGame(data.gameID)});

  // Update the gamelist for all players and rooms
  // io.sockets.emit('gameList', {gameList:createGameList()});
  io.sockets.emit('gameList', {gameList:gamestack.getGamelist()});

  // remove this game if the game was won/lost
  if(gamestack.getGame(data.gameID).actorCount === 7 || gamestack.getGame(data.gameID).isBacon === true) {
    removeGame(data.gameID);
  }

};


// Todo: removeGame needs redesign and object integration

var removeGame = function(ID) {

 gamestack.getGame(ID).cardStack = [{name:'Game Over'}];
 gamestack.getGame(ID).playerList = {deadGame:'Game Over'};
 gamestack.getGame(ID).isBacon = true;

 // Send out a roomwide leaveroom event, so that all sockets come back and
 // leave the room
 io.sockets.in(ID).emit('leaveroom');

 // Send revised game list
 io.sockets.emit('gameList', {gameList:gamestack.getGamelist()});

};
/*   End of File  */