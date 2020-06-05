const cp = require ('child_process')
const fs = require ('fs')
const https = require('https');
const WebSocket = require('ws');
 
const server = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/verilog.ecn.purdue.edu/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/verilog.ecn.purdue.edu/fullchain.pem')
});
const wss2 = new WebSocket.Server({ server });

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
}

function runTestbench () {
    testbench = cp.execSync ("make 2>&1 | grep -Po '\/\.\/[^\\n]+'")
    console.log (testbench.toString().replaceAll ('/./', ''))
}
 
wss2.on('connection', function connection(ws2) {
  ws2.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  runTestbench()
});

server.on ('upgrade', function upgrade (request, socket, head) {
    const pathname = url.parse (request.url).pathname;
    wss.handleUpgrade (request, socket, head, function done (ws) {
        wss.emit ('connection', ws, request);
    });
}); 
 
server.listen(2443, "0.0.0.0");