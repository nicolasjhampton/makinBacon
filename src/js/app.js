'use strict';

var express = require('express');

var app = express();

app.get('/', function (request, response){

  response.send('Express is working on port 3000');
  
});

app.listen(3000);
