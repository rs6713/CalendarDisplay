/* 
*  Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. 
*  See LICENSE in the source repository root for complete license information. 
*/
var https = require('https');
//var http= require('http');
var express = require('express');

var app = express();
var morgan = require('morgan');
var path = require('path'); 
var fs= require('fs');

var options = {
  key: fs.readFileSync(path.resolve('keycert/key.pem')),
  cert: fs.readFileSync(path.resolve('keycert/cert.pem'))
};

// Initialize variables. 
var port = process.env.PORT || 5000; 

// Configure morgan module to log all requests.
app.use(morgan('dev')); 

// Set the front-end folder to serve public assets.
app.use(express.static(__dirname + '/public'));
app.use("/bower_components", express.static(path.join(__dirname, 'bower_components')));

// Set up our one route to the index.html file.
app.get('*', function (req, res) {
  console.log(__dirname);
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

//https.createServer(options, app).listen(port)
console.log('Listening on port ' + port + '...'); 

//Start the server.  
//app.listen(port);

http.createServer(app).listen(port);
//Redirect URL https://nbcalendar.herokuapp.com