var startNewGame = function (data, socket) {
    data['gameID'] = createGame(data.player);
    data['type'] = "actors";
    data['firstStackEmit'] = true;
    socket.join(data.gameID);
    var getPopularPage = getApiOptions('popular', random(true));
    request(getPopularPage)
        .then(JSON.parse)
        .then(getRandomActor)
        .then(request)
        .then(JSON.parse)
        .then(function (response) {
        return createFirstStackObject(response, data);
    })
        .then(sendStack);
};
var joinGameInProgress = function (data, socket) {
    socket.join(data.gameID);
    if (!gameStack[data.gameID].playerList[data.player]) {
        gameStack[data.gameID].playerList[data.player] = 0;
    }
    sendStack(data);
};
var addChoiceAndUpdateGame = function (data) {
    var stack = gameStack[data.gameID].stack;
    if (data.type !== stack[stack.length - 1].type) {
        var options = getApiOptions(data.type, data.id);
        request(options)
            .then(JSON.parse)
            .then(function (response) {
            return createStackObject(response, data);
        })
            .then(checkBacon)
            .then(sendStack);
    }
};
