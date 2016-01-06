var express = require('express'), app = express(), server = require('http').createServer(app), io = require('socket.io')(server);
var request = require('request-promise');
var server_port = process.env.PORT || 5000;
app.set('port', server_port);
app.use(express.static(__dirname + '/public'));
server.listen(app.get('port'), function () {
    console.log("Listening on port " + app.get('port'));
});

var ApiRequest = (function () {
    function ApiRequest(requestType, id) {
        this.requestType = requestType;
        this.id = id;
        this.apiUrl = 'https://api.themoviedb.org/3/';
        this.apiKey = '';
        this.options = { url: "", method: "GET" };
        switch (requestType) {
            case 'popular':
                this.options.url = this.apiUrl + 'person/popular?page=' + this.id + '&api_key=' + this.apiKey;
                break;
            case 'actors':
                this.options.url = this.apiUrl + 'person/' + this.id + '?api_key=' + this.apiKey + '&append_to_response=movie_credits';
                break;
            case 'movies':
                this.options.url = this.apiUrl + 'movie/' + this.id + '?api_key=' + this.apiKey + '&append_to_response=credits';
                break;
        }
    }
    return ApiRequest;
})();
var Poster = (function () {
    function Poster(pageUrl) {
        this.pageUrl = pageUrl;
        this.baseUrl = 'http://image.tmdb.org/t/p/w92';
        this.unknownImg = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_(black_on_white).png';
        if (pageUrl !== null) {
            this.url = this.baseUrl + this.pageUrl;
        }
        else {
            this.url = this.unknownImg;
        }
    }
    return Poster;
})();

var StackCard = (function () {
    function StackCard(jsonObject, data) {
        var cast;
        var nameKey;
        var creditsType;
        var creditsKey;
        var posterKey;
        if (data.type === "actors") {
            cast = jsonObject.movie_credits.cast;
            nameKey = "name";
            creditsKey = "original_title";
            creditsType = "movies";
            posterKey = 'profile_path';
        }
        else if (data.type === "movies") {
            cast = jsonObject.credits.cast;
            nameKey = "original_title";
            creditsKey = "name";
            creditsType = "actors";
            posterKey = 'poster_path';
        }
        var credits = cast.map(function (obj) {
            return {
                type: creditsType,
                name: obj[creditsKey],
                id: obj.id
            };
        });
        this.gameID = data.gameID;
        this.player = data.player;
        this.type = data.type;
        this.name = jsonObject[nameKey];
        this.id = jsonObject.id;
        this.poster = new Poster(jsonObject[posterKey]);
        this.credits = credits;
    }
    return StackCard;
})();
var Game = (function () {
    function Game(gameID, startingPlayer) {
        this.gameID = gameID;
        var players = {};
        players[startingPlayer] = 0;
        this.playerList = players;
        this.actorCount = 0;
        this.isBacon = false;
        this.cardStack = [];
    }
    Game.prototype.pushCard = function (jsonObject, data) {
        var stackcard = new StackCard(jsonObject, data);
        if (data.firstStackEmit !== true) {
            this.playerList[data.player] += 100;
        }
        if (data.type === "actors") {
            this.actorCount += 1;
        }
        this.cardStack.push(stackcard);
        return data;
    };
    return Game;
})();
var GameStack = (function () {
    function GameStack() {
        this.stack = [];
        this.gameCount = 0;
    }
    GameStack.prototype.getGamelist = function () {
        return this.stack.map(function (obj) {
            return {
                gameID: obj.gameID,
                playerList: obj.playerList,
                starting: obj.cardStack[0].name || null
            };
        });
    };
    GameStack.prototype.addGame = function (data) {
        var game = new Game(this.gameCount, data.player);
        this.stack[this.gameCount] = game;
        this.gameCount++;
        return game.gameID;
    };
    GameStack.prototype.getGame = function (gameID) {
        return this.stack[gameID];
    };
    return GameStack;
})();

var gamestack = new GameStack();

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

var random = function (type) {
    if (type) {
        return Math.floor((Math.random() * 100) + 1);
    }
    else {
        return Math.floor((Math.random() * 20));
    }
};
var getRandomActor = function (pageJSONObject) {
    var chosenActor = pageJSONObject.results[random(false)];
    var actorRequest = new ApiRequest('actors', chosenActor.id);
    return actorRequest.options;
};

//# sourceMappingURL=app.js.map
