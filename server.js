/* 
    server.js
    Author: Niraj Menon
    First creation date: 7/20/19

    Description: 
    Entry point for simulator application.
    
    Sets up and configures the Express app which will handle the regular
    HTTP routes, including features for login, signup, password reset,
    session handling, landing pages, static content, etc.
*/

const fs = require('fs-extra'),
      path = require('path'),
      process = require('process'),
      express = require ('express'),
      app = express(),
      cors = require ('cors'),
      expressSanitizer = require('express-sanitizer'),
      favicon = require('serve-favicon');

app.use (expressSanitizer());
app.use (express.json());
// eslint-disable-next-line no-undef
app.use (favicon(path.join(__dirname, 'favicon.ico')));
app.use (cors(['https://verilog.ecn.purdue.edu', 'https://engineering.purdue.edu']));
app.use ('/assets', express.static(path.join(__dirname, '/assets')));
app.use ('/md', express.static(path.join(__dirname, '/md')));

app.get ('/', async function (req, res) {
    res.sendFile (__dirname + '/index.html');
});

app.get ('/help', function (req, res) {
    res.send (fs.readFileSync (__dirname + '/manual.html').toString())
});

app.get ('/help/*', function (req, res) {
    res.sendFile (__dirname + '/md/' + req.url.replace ('/help/', ''))
});

function debugLog (message) {
    console.log (getTime() + ": " + message)
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function exitHandler (options) {
    if (options.cleanup) debugLog ("Fatal SIGINT occurred")
    if (options.exit) process.exit()
}

process.on ('SIGTERM', function () {
    debugLog ("Simulator main process was SIGTERM'ed! Exiting!")
    process.exit()
})

process.on ('SIGINT', exitHandler.bind (null, {exit: true}))
process.on ('uncaughtException', function (err) {
    debugLog ('uncaughtException! Details: \n')
    console.error (err)
})

function getTime()
{
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var min = (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())
    var sec = (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds())
    var time = today.getHours() + ":" + min + ":" + sec;
    return (date + ' ' + time);
}

module.exports = app
