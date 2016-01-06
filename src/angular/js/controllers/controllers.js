/************************
 3. controllers.js
 ************************/

(function(){

  var app = angular.module('myApp.mainController', []);

  // Controller for the input and stack display
  app.controller('MainCtrl', function($scope, socket){

    this.usernamePresent = false;

    // Shows or doesn't show our game elements
    this.inGame = false;



    /**********************
      Socket listeners
     **********************/

     // controller reference for our callbacks
     var main = this;


    socket.on('init', function(data){

      main.game = data.game;
      main.gameList = data.gameList;
      main.username = data.username;
      $scope.$digest();

    });

    socket.on('gameList', function(data){
      main.gameList = data.gameList;
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
        main.nextcredits = data.game.cardStack[data.game.cardStack.length - 1].credits
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
/*  end of file  */