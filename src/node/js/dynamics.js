var createFirstStackObject = function (jsonObject, data) {
    addActorToStack(jsonObject, data);
    return data;
};
var createStackObject = function (jsonObject, data) {
    if (data.type === "actors") {
        addActorToStack(jsonObject, data);
    }
    else if (data.type === "movies") {
        addMovieToStack(jsonObject, data);
    }
    return data;
};
var addActorToStack = function (jsonObject, data) {
    var newActorObject = createActorObject(jsonObject, data);
    if (data.firstStackEmit !== true) {
        gameStack[data.gameID].playerList[data.player] += 100;
    }
    gameStack[data.gameID].actorCount += 1;
    gameStack[data.gameID].stack.push(newActorObject);
};
var addMovieToStack = function (jsonObject, data) {
    var newMovieObject = createMovieObject(jsonObject, data);
    gameStack[data.gameID].playerList[data.player] += 100;
    gameStack[data.gameID].stack.push(newMovieObject);
};
var checkBacon = function (data) {
    var ID = data.gameID;
    var player = data.player;
    var baconSearch = gameStack[ID].stack[gameStack[ID].stack.length - 1].credits;
    for (var actor = 0; actor < baconSearch.length; actor++) {
        if (baconSearch[actor].id === 4724) {
            gameStack[ID].actorCount += 1;
            gameStack[ID].playerList[player] += 100;
            gameStack[ID].stack.push(returnBacon(data));
            gameStack[ID].isBacon = true;
            break;
        }
    }
    return data;
};
var returnBacon = function (data) {
    var kevinBacon = {
        gameID: data.gameID,
        player: data.player,
        type: "actors",
        name: "Kevin Bacon",
        id: 4724,
        poster: "http://image.tmdb.org/t/p/w92/p1uCaOjxSC1xS5TgmD4uloAkbLd.jpg",
        credits: []
    };
    return kevinBacon;
};
