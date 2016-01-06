var startNewGame = function (data, socket) {
    var gameID = gamestack.addGame(data);
    data['gameID'] = gameID;
    data['type'] = "actors";
    data['firstStackEmit'] = true;
    socket.join(gameID);
    var getPopularPage = new ApiRequest('popular', random(true));
    request(getPopularPage.options)
        .then(JSON.parse)
        .then(getRandomActor)
        .then(request)
        .then(JSON.parse)
        .then(function (response) {
        return gamestack.getGame(data.gameID).pushCard(response, data);
    })
        .then(sendStack);
};
var joinGameInProgress = function (data, socket) {
    socket.join(data.gameID);
    if (!gamestack.getGame(data.gameID).playerList[data.player]) {
        gamestack.getGame(data.gameID).playerList[data.player] = 0;
    }
    sendStack(data);
};
var addChoiceAndUpdateGame = function (data) {
    var stack = gamestack.getGame(data.gameID).cardStack;
    if (data.type !== stack[stack.length - 1].type) {
        var apiRequest = new ApiRequest(data.type, data.id);
        request(apiRequest.options)
            .then(JSON.parse)
            .then(function (response) {
            return gamestack.getGame(data.gameID).pushCard(response, data);
        })
            .then(checkBacon)
            .then(sendStack);
    }
};
