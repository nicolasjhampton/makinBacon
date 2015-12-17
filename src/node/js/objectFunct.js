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
