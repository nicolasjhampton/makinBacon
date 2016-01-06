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
