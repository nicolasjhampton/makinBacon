/**************************************
 3. Open socket routes: Main program here
 **************************************/
 
 /// <reference path="server.ts" />
 /// <reference path="gameflow.ts" />

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
/*   End of File  */