var checkBacon = function (data) {
    var ID = data.gameID;
    var player = data.player;
    var currentCardStack = gamestack.getGame(ID).cardStack;
    var baconSearch = currentCardStack[currentCardStack.length - 1].credits;
    for (var actor = 0; actor < baconSearch.length; actor++) {
        if (baconSearch[actor].id === 4724) {
            gamestack.getGame(ID).actorCount += 1;
            gamestack.getGame(ID).playerList[player] += 100;
            gamestack.getGame(ID).cardStack.push(returnBacon(data));
            gamestack.getGame(ID).isBacon = true;
            break;
        }
    }
    return data;
};
var returnBacon = function (data) {
    var jsonObject = {
        name: "Kevin Bacon",
        id: 4724,
        poster: "http://image.tmdb.org/t/p/w92/p1uCaOjxSC1xS5TgmD4uloAkbLd.jpg",
        credits: []
    };
    var kevinBacon = new StackCard(jsonObject, data);
    return kevinBacon;
};
