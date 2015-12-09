/***********************
 5. Emitters
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
/*   End of File  */