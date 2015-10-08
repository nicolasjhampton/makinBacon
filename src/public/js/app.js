(function(){

  // Create app, attach all parts to variable
  var app = angular.module("myApp", ["myApp.factories"]);

    // simple socket.io service
    //app.factory('socket', function() {
    //  var socket = io.connect();
    //  return socket;
    //});

    // Directive for our game input to choose a movie/actor
    app.directive('picker', function() {
          return {
            restrict: 'E',
            scope: {
              nextcredits: '=',
              gameid: '='
            },
            templateUrl: './js/directives/_picker.html',
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
            templateUrl: './js/directives/_playerList.html'
          };
      });

    app.directive('usernameInput', function() {
          return {
            restrict: 'E',
            scope:{
              username: '='
            },
            templateUrl: './js/directives/_usernameInput.html',
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
            templateUrl: './js/directives/_gameSelector.html',
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
        templateUrl: './js/directives/_gameScore.html'
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

      /*
      this.username = "";

      // Set the initial displayed option to empty
      this.option = {id:"", name:"", type:""};

      // We start out without a gameID
      this.gameID = "uninitialized";
      */

      this.usernamePresent = false;

      // Shows or doesn't show our game elements
      this.inGame = false;



      /**********************
        Socket listeners
       **********************/

       // controller reference for our callbacks
       var main = this;

      /*
       * 'gameList': socket listener for our list of current games
       */
      socket.on('gameList', function(data){
        main.usernamePresent = true;
        main.gameList = data.gameList;
        console.log(data.gameList);
        $scope.$digest();
      });

      /*
       * 'update': Socket listener for our stack updates
       */
      socket.on('update', function(data){

        console.log(data);
        // Update our local stack variable in the scope
        main.game = data.game;

        //This is how we direct each pick for our picker
        main.gameID = data.game.gameID;



        // This actually tests to see if we're in a game yet
        if(Object.keys(data.game)[0] !== undefined) {

          // turns our game elements on
          main.inGame = true;

          //this will be the list of picks for the picker
          main.nextcredits = data.game.stack[data.game.stack.length - 1].credits
          console.log(main.nextcredits);
          main.playerList = Object.keys(data.game.playerList).map(function(value) {
            return {name:value, score:data.game.playerList[value]};
          });
        }

        $scope.$digest();

      }); // End of update socket listener

      /*
       * This is an echo that causes all players in a room to emit
       * a signal to the server to detach them from this room
       */
      socket.on('leaveroom', function() {

        socket.emit('leaveroom', {ID:main.gameID});

      });
    }); // End of controller
})();
