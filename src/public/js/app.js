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
              selection: '='
            },
            templateUrl: './js/directives/_picker.html'
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

      /**********************
        Socket listeners
       **********************/

      /*
       * 'gameList': socket listener for our list of current games
       */
      socket.on('gameList', function(data){
        $scope.gameList = data.gameList;
        $scope.$digest();
      });

      /*
       * 'update': Socket listener for our stack updates
       */
      socket.on('update', function(data){

        // Update our local stack variable in the scope
        $scope.stack = data.game.stack;
        $scope.gameID = data.game.gameID;

        // Updates the view with new stack data
        $scope.$digest();

      }); // End of update socket listener

      /**********************
        Buttons
      ***********************/

      // Button for emitting new stack addition
      $scope.selection = function (data) {

        // We're going to emit this to the always listening update
        // socket on the server, server will re-emit to our
        // specific room after changes
        // {gameID: index, type: ('movies' or 'actors'), id:(id of movie or actor) }
        var message = {
                        gameID:$scope.gameID,
                        type: data.type,
                        id: data.id,
                      };

        console.log(message);
        socket.emit('update', message);

      }; // End of emit update button


      // Button to start a new game
      $scope.newGameStart = function () {
        var message = {gameID:'newGame'};
        socket.emit('select game', message);
      }


      // Button to switch to another game
      $scope.gameSelect = function (data) {
        var message = {gameID:$scope.game.gameID};
        socket.emit('select game', message);
      }
    }); // End of controller

})();
