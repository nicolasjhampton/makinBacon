(function(){

  var app = angular.module('myApp.mainController', []);

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
