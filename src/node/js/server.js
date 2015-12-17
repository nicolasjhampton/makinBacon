var express = require('express'), app = express(), server = require('http').createServer(app), io = require('socket.io')(server);
var request = require('request-promise');
var server_port = process.env.PORT || 5000;
app.set('port', server_port);
app.use(express.static(__dirname + '/public'));
server.listen(app.get('port'), function () {
    console.log("Listening on port " + app.get('port'));
});
