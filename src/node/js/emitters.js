var newPlayerInit = function (socket, data) {
    socket.username = data.username;
    socket.emit('init', { game: {}, gameList: createGameList(), username: socket.username });
};
var sendStack = function (data) {
    io.sockets.in(data.gameID).emit('update', { game: gameStack[data.gameID] });
    io.sockets.emit('gameList', { gameList: createGameList() });
    if (gameStack[data.gameID].actorCount === 7 || gameStack[data.gameID].isBacon === true) {
        removeGame(data.gameID);
    }
};
var removeGame = function (ID) {
    gameStack[ID].stack = [{ name: 'Game Over' }];
    gameStack[ID].players = { deadGame: 'Game Over' };
    gameStack[ID].isBacon = true;
    io.sockets.in(ID).emit('leaveroom');
    io.sockets.emit('gameList', { gameList: createGameList() });
};
