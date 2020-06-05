/* 
    server.js
    Author: Niraj Menon
    First creation date: 7/20/19

    Description: 
    Entry point for simulator application. Run as sudo to grab the
    certificates for the domain name to run an HTTPS server on port 443.
    
    Sets up and configures the Express app which will handle the regular
    HTTP routes, including features for login, signup, password reset,
    session handling, landing pages, static content, etc.
    The routes themselves are in route.js.

    Configures entry point for WebSocket handling. When the server object
    receives an Upgrade request, it first checks for session data to
    check if it was validated, then calls the WS handler from simulate.js.
*/

function debugLog (message) {
    console.log (getTime() + ": " + message)
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const fs = require('fs-extra'),
      path = require('path'),
      process = require('process'),
      express = require ('express'),
      app = express(),
      expressSanitizer = require('express-sanitizer'),
      favicon = require('serve-favicon');

app.use (expressSanitizer());
app.use (express.json());
// eslint-disable-next-line no-undef
app.use (favicon(path.join(__dirname, 'favicon.ico')));
app.use ('/assets', express.static(__dirname + '/assets'));
app.use ('/md', express.static(__dirname + '/md'));

app.get ('/', function (req, res) {
    res.sendFile (__dirname + '/index.html')
});

app.get ('/help', function (req, res) {
    res.send (fs.readFileSync ('manual.html').toString())
});

module.exports = app
