io.sockets.on('connect', function (socket) {
    socket.on('adduser', function (data) {
        newPlayerInit(socket, data);
    });
    socket.on('select game', function (data) {
        if (data.gameID === 'newGame') {
            startNewGame(data, socket);
        }
        else {
            joinGameInProgress(data, socket);
        }
    });
    socket.on('update', function (data) {
        addChoiceAndUpdateGame(data);
    });
    socket.on('leaveroom', function (data) {
        socket.leave(data.ID);
    });
});
