'use strict';

/**********************************
 1. express http/socket.io boilerplate
 **********************************/

// Starting our http/socket.io server
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

var request = require('request-promise');

// Openshift adaptive enviornment variables
var server_port = process.env.PORT || 5000;

// set port for our express instance
app.set('port', server_port);

// define public folder to serve static files
app.use(express.static(__dirname + '/public'));

// Set the sever to listen for get requests
server.listen(app.get('port'), function () {
   console.log("Listening on port " + app.get('port'));
});
/*   End of File  */