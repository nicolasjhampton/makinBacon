var newPlayerInit = function (socket, data) {
    socket.username = data.username;
    socket.emit('init', { game: {}, gameList: gamestack.getGamelist(), username: socket.username });
};
var sendStack = function (data) {
    console.log(gamestack.getGame(data.gameID));
    io.sockets.in(data.gameID).emit('update', { game: gamestack.getGame(data.gameID) });
    io.sockets.emit('gameList', { gameList: gamestack.getGamelist() });
    if (gamestack.getGame(data.gameID).actorCount === 7 || gamestack.getGame(data.gameID).isBacon === true) {
        removeGame(data.gameID);
    }
};
var removeGame = function (ID) {
    gamestack.getGame(ID).cardStack = [{ name: 'Game Over' }];
    gamestack.getGame(ID).playerList = { deadGame: 'Game Over' };
    gamestack.getGame(ID).isBacon = true;
    io.sockets.in(ID).emit('leaveroom');
    io.sockets.emit('gameList', { gameList: gamestack.getGamelist() });
};
