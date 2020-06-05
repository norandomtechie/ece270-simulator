/* 
    cluster.js
    Author: Niraj Menon
    First creation date: 1/9/20

    Description: 
    Instantiates the WebSocket server and related methods, and spawns
    eight instances of the server code given in server.js.

    Technically, the entry point is in server.js, but cluster.js is
    the top level file since it sits on top of the eight server.js
    instances.
*/

const http = require("http")
const os = require("os")
const https = require('follow-redirects').https
const fs = require('fs')
const hostname = os.hostname() // needs the thing for checking which server we're using
const url = require('url')
const Tail = require('tail').Tail

const app = require ('./server')

const server = https.createServer(app)
const WebSocket = require('ws')
const wss = new WebSocket.Server ({ clientTracking: true, noServer: true })

process.on ('SIGTERM', function () {
    debugLog ("Simulator main process was SIGTERM'ed! Exiting!")
    process.exit()
})

process.on ('SIGINT', exitHandler.bind (null, {exit: true}))
process.on ('uncaughtException', function (err) {
    debugLog ('uncaughtException! Details: \n')
    console.error (err)
})

function exitHandler (options) {
    if (options.cleanup) debugLog ("Fatal SIGINT occurred")
    if (options.exit) process.exit()
}

function debugLog (message) {
    console.log (getTime() + ": " + message)
}

function getTime()
{
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var min = (today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes())
    var sec = (today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds())
    var time = today.getHours() + ":" + min + ":" + sec;
    return (date + ' ' + time);
}

access_tail = new Tail ("logging/access.log")
simulation_tail = new Tail ("analytics/simulation.log")


if (module.parent) { // not launched directly
    module.exports = app
}
else {
    wss.on ('simulate', require ('./simulate'));
    server.on ('upgrade', function upgrade (request, socket, head) {
        wss.handleUpgrade (request, socket, head, function done (ws) {
            wss.emit ('simulate', ws, request);
        });
    });
    server.listen (4500, '0.0.0.0');
}