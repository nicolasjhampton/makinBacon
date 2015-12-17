/************************
 1. socket.js
 ************************/

(function(){

  // simple socket.io service

  var app = angular.module('myApp.factories', []);

  app.factory('socket', function() {
    var socket = io.connect();
    return socket;
  });

})();
/*  end of file  */