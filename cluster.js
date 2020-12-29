/* 
    cluster.js
    Author: Niraj Menon
    First creation date: 1/9/20
    Last modified: 12/28/2020

    Description: 
    Instantiates the WebSocket server and related methods, and spawns
    eight instances of the server code given in server.js.

    If this is from the public ece270-simulator repo, it only runs a 
    single instance of server.js.
*/

const http = require("http")
const os = require("os")
const fs = require('fs')
const cp = require('child_process')
const hostname = os.hostname() // needs the thing for checking which server we're using
const url = require('url')

const app = require ('./server')
const server = http.createServer(app)

const WebSocket = require('ws')
const wss = new WebSocket.Server ({ clientTracking: true, noServer: true })

process.on ('SIGTERM', function () {
    cp.execSync ('pkill -9 cvc64')
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
    server.listen (4500, '127.0.0.1', null, function() {
        console.log ("Simulator started and running on port 4500.")
    });
}