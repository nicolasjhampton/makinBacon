'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    Request = require('request');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views/layouts');

app.get('/', function (request, response){

  response.send('Express is working on port 3000');

});

app.listen(app.get('port'), function() {
  console.log('Express is running a Frontend server on port:' + port);
});
