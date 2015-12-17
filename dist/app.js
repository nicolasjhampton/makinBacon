var express = require('express'), app = express(), server = require('http').createServer(app), io = require('socket.io')(server);
var request = require('request-promise');
var server_port = process.env.PORT || 5000;
app.set('port', server_port);
app.use(express.static(__dirname + '/public'));
server.listen(app.get('port'), function () {
    console.log("Listening on port " + app.get('port'));
});

var gameStack = [];
var newGame = true;
var gameNumber = 0;

io.sockets.on('connect', function (socket) {
    socket.on('adduser', function (data) {
        newPlayerInit(socket, data);
    });
    socket.on('select game', function (data) {
        console.log('selection received');
        if (data.gameID === 'newGame') {
            startNewGame(data, socket);
        }
        else {
            joinGameInProgress(data, socket);
        }
    });
    socket.on('update', function (data) {
        console.log('new addition to the stack received ' + data.gameID);
        addChoiceAndUpdateGame(data);
    });
    socket.on('leaveroom', function (data) {
        socket.leave(data.ID);
    });
});

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

var getApiOptions = function (optionsRequest, idOrPage) {
    var apiKey = '';
    var apiUrl = 'https://api.themoviedb.org/3/';
    switch (optionsRequest) {
        case 'popular':
            return {
                url: apiUrl + 'person/popular?page=' + idOrPage + '&api_key=' + apiKey,
                method: "GET"
            };
            break;
        case 'actors':
            return {
                url: apiUrl + 'person/' + idOrPage + '?api_key=' + apiKey + '&append_to_response=movie_credits',
                method: "GET"
            };
            break;
        case 'movies':
            return {
                url: apiUrl + 'movie/' + idOrPage + '?api_key=' + apiKey + '&append_to_response=credits',
                method: "GET"
            };
            break;
    }
};
var getPosterUrl = function (pageUrl) {
    var posterUrl = 'http://image.tmdb.org/t/p/w92';
    var unknownImg = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_(black_on_white).png';
    if (pageUrl !== null) {
        return posterUrl + pageUrl;
    }
    else {
        return unknownImg;
    }
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
    return getApiOptions('actors', chosenActor.id);
};

var createGameList = function () {
    var gameList = gameStack.map(function (obj) {
        var game = {
            gameID: obj.gameID,
            playerList: obj.playerList,
            starting: obj.stack[0].name || null
        };
        return game;
    });
    return gameList;
};
var createGame = function (startingPlayer) {
    var newGameID = gameNumber;
    gameNumber++;
    var players = {};
    players[startingPlayer] = 0;
    var game = {
        gameID: newGameID,
        playerList: players,
        actorCount: 0,
        isBacon: false,
        stack: []
    };
    gameStack[newGameID] = game;
    return newGameID;
};
var createMovieObject = function (jsonObject, data) {
    var movieTitle = jsonObject.original_title;
    var movieID = jsonObject.id;
    var moviePoster = getPosterUrl(jsonObject.poster_path);
    var movieCast = jsonObject.credits.cast.map(function (obj) {
        var actor = {
            type: "actors",
            name: obj.name,
            id: obj.id
        };
        return actor;
    });
    var newMovieObject = {
        gameID: data.gameID,
        player: data.player,
        type: "movies",
        name: movieTitle,
        id: movieID,
        poster: moviePoster,
        credits: movieCast
    };
    return newMovieObject;
};
var createActorObject = function (jsonObject, data) {
    var actorName = jsonObject.name;
    var actorID = jsonObject.id;
    var actorPoster = getPosterUrl(jsonObject.profile_path);
    var actorMovies = jsonObject.movie_credits.cast.map(function (obj) {
        var movie = {
            type: "movies",
            name: obj.original_title,
            id: obj.id
        };
        return movie;
    });
    var newActorObject = {
        gameID: data.gameID,
        player: data.firstStackEmit ? "start" : data.player,
        type: "actors",
        name: actorName,
        id: actorID,
        poster: actorPoster,
        credits: actorMovies
    };
    return newActorObject;
};

//# sourceMappingURL=app.js.map
