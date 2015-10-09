(function(){

var app = angular.module("myApp.directives", []);

// Directive for our game input to choose a movie/actor
app.directive('picker', function() {
      return {
        restrict: 'E',
        scope: {
          nextcredits: '=',
          gameid: '='
        },
        templateUrl: './js/directives/partials/_picker.html',
        controller: function (socket) {

          // Button for emitting new stack addition
          this.selection = function (data, gameID) {
            // We're going to emit this to the always listening update
            // socket on the server, server will re-emit to our
            // specific room after changes
            // {gameID: index, player: (player who made choice, this client), type: ('movies' or 'actors'), id:(id of movie or actor) }
            var message = {
                            gameID: gameID,
                            player: socket.username,
                            type: data.type,
                            id: data.id,
                          };

            socket.emit('update', message);

          }; // End of emit update button

        },
        controllerAs: 'picker'
      };
  });

app.directive('playerList', function() {
      return {
        restrict: 'E',
        scope: {
          listofplayers: '='
        },
        templateUrl: './js/directives/partials/_playerList.html'
      };
  });

app.directive('usernameInput', function() {
      return {
        restrict: 'E',
        scope:{
          username: '='
        },
        templateUrl: './js/directives/partials/_usernameInput.html',
        controller: function (socket) {

          this.createUsername = function(username) {
            socket.username = username;
            socket.emit('adduser', {username:socket.username});
          };

        },
        controllerAs: 'usernameInput'
      };
});

// Directive for our game input to choose a movie/actor
app.directive('gameSelector', function() {
      return {
        restrict: 'E',
        scope: {
          gamelist: '='
        },
        templateUrl: './js/directives/partials/_gameSelector.html',
        controller: function (socket) {

          // Button to start a new game
          this.startNewGame = function () {
            var message = {gameID:'newGame', player:socket.username};
            socket.emit('select game', message);
          };

          // Button to switch to another game
          this.joinGame = function (data) {
            var message = {gameID:data.gameID, player:socket.username};
            socket.emit('select game', message);
          };

        },
        controllerAs: 'gameSelector'
      };
  });

app.directive('gameScore', function() {
  return {
    restrict: 'E',
    scope: {
      count: '='
    },
    templateUrl: './js/directives/partials/_gameScore.html'
  }
});

// Directive for each item in the gameStack
app.directive('gameStack', function() {
      return {
        restrict: 'E',
        scope: {
          stackitem: '=stackitem',
          first: '=first',
          last: '=last'
        },
        templateUrl: './js/directives/partials/_gameStack.html',
        link: function(scope) {

          // This decided how each stackitem is laid out
          if(scope.stackitem.type === 'actors') {
            scope.push = "";
            scope.pull = "text-align";
            if(scope.first) {
              scope.subtitle = "was in...";
            } else if(scope.last){
              scope.subtitle = "";
            } else {
              scope.subtitle = "who was in...";
            }
          } else if(scope.stackitem.type === 'movies') {
            scope.push = "col-xs-push-9";
            scope.pull = "col-xs-pull-3";
            scope.subtitle = "with..."
          }

        } // end of link
      }; // end of return
  }); // end of directive

})();
