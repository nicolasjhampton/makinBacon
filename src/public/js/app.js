(function(){

  // Create app, attach all parts to variable
  var app = angular.module("myApp", []);

    // simple socket.io service
    app.factory('socket', function() {
      var socket = io.connect();
      return socket;
    });

    app.directive('gameStack', function() {
          return {
            restrict: 'E',
            scope: {
              stackitem: '=stackitem'
            },
            templateUrl: './js/directives/mainGameStack.html',
            link: function(scope) {
              if(scope.stackitem.type === 'actors') {
                scope.push = "";
                scope.pull = "text-align";
                scope.subtitle = "was in..."
              } else {
                scope.push = "col-xs-push-9";
                scope.pull = "col-xs-pull-3";
                scope.subtitle = "with..."
              }
            }
          };
      });

    // Controller for the input and stack display
    app.controller('MainCtrl', function($scope, socket){

      // Set the initial displayed option to empty
      $scope.option = {id:"", name:"", type:""};
      /*
      $scope.stack = [
        {
          type: 'actors',
          name: 'actorName',
          id: 'actorID',
          poster: 'actorPoster',
          credits: {
            type: 'movies',
            name: 'obj.original_title',
            id: 'obj.id'
          }
        }
      ];
      */
      // This variable is hooked to the choice Button
      // not really needed, take out or modify later
      $scope.show = true;

      /*
       * Socket listener for incoming stack updates
       * Note: we're going to change this listener to
       * be game instance specific
       */
      socket.on('update', function(data){

        // Update our local stack variable in the scope
        $scope.stack = data.stack;

        // Updates the view with new stack data
        $scope.$digest();

      }); // End of update socket listener

      // Button for emitting new stack addition
      $scope.selection = function (data) {

        // We're going to emit this to the always listening update
        // socket on the server, server will re-emit to our
        // specific room after changes
        socket.emit('update', data);

      }; // End of emit button
    }); // End of controller

})();
