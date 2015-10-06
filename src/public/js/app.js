(function(){

  // Create app, attach all parts to variable
  var app = angular.module("myApp", []);

    // simple socket.io service
    app.factory('socket', function() {
      var socket = io.connect();
      return socket;
    });

    // Directive for our game input to choose a movie/actor
    app.directive('picker', function() {
          return {
            restrict: 'E',
            scope: {
              topofstack: '=topofstack',
              selectoption: '='
            },
            templateUrl: './js/directives/_picker.html'
          };
      });

    app.directive('playerList', function() {
          return {
            restrict: 'E',
            scope: {
              listofplayers: '='
            },
            templateUrl: './js/directives/_playerList.html'
          };
      });

    // Directive for our game input to choose a movie/actor
    app.directive('gameSelector', function() {
          return {
            restrict: 'E',
            scope: {
              new: '&',
              join: '=',
              adduser: '=',
              gamelist: '=',
              userentered: '=',
              username: '='
            },
            templateUrl: './js/directives/_gameSelector.html'
          };
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
            templateUrl: './js/directives/_gameStack.html',
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

    // Controller for the input and stack display
    app.controller('MainCtrl', function($scope, socket){

      // Set the initial displayed option to empty
      $scope.option = {id:"", name:"", type:""};

      // We start out without a gameID
      $scope.gameID = "uninitialized";

      $scope.usernamePresent = false;

      // Shows or doesn't show our game elements
      $scope.inGame = false;

      /**********************
        Socket listeners
       **********************/

      /*
       * 'gameList': socket listener for our list of current games
       */
      socket.on('gameList', function(data){
        $scope.gameList = data.gameList;
        console.log(data.gameList);
        $scope.$digest();
      });

      /*
       * 'update': Socket listener for our stack updates
       */
      socket.on('update', function(data){

        // Update our local stack variable in the scope
        $scope.game = data.game;
        $scope.gameID = data.game.gameID;

        // This actually tests to see if we're in a game yet
        if(Object.keys(data.game)[0] !== undefined) {

          // turns our game elements on
          $scope.inGame = true;

          $scope.playerList = Object.keys(data.game.playerList).map(function(value) {
            return {name:value, score:data.game.playerList[value]};
          });
          console.log($scope.playerList)
        }

        $scope.$digest();

      }); // End of update socket listener

      // This is an echo that causes all players in a room to emit
      // a signal to the server to detach them from this room
      socket.on('leaveroom', function() {
        socket.emit('leaveroom', {ID:$scope.gameID});
      });

      /**********************
        Buttons
      ***********************/

      $scope.createUsername = function() {
        $scope.usernamePresent = true;
        socket.emit('adduser', {username:$scope.username});
      };

      // Button to start a new game
      $scope.startNewGame = function () {
        var message = {gameID:'newGame', player:$scope.username};
        socket.emit('select game', message);
      };

      // Button to switch to another game
      $scope.joinGame = function (data) {
        var message = {gameID:data.gameID, player:$scope.username};
        socket.emit('select game', message);
      };

      // Button for emitting new stack addition
      $scope.selection = function (data) {

        // We're going to emit this to the always listening update
        // socket on the server, server will re-emit to our
        // specific room after changes
        // {gameID: index, player: (player who made choice, this client), type: ('movies' or 'actors'), id:(id of movie or actor) }
        var message = {
                        gameID:$scope.gameID,
                        player: $scope.username,
                        type: data.type,
                        id: data.id,
                      };

        socket.emit('update', message);

      }; // End of emit update button
    }); // End of controller
})();
