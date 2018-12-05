const dns = require('native-dns');
const fs  = require("fs");

var last = 0;
var failures = 0;
var servers = JSON.parse( fs.readFileSync('servers.json') );

function dateStamp() {
    var event = new Date();
    return event.toISOString().slice(0, 10).trim() + ' ' + event.toTimeString().slice(0, 8).trim();;
}

function queryDNS(server) {
    return new Promise(function(resolve) {
        let response={
            error: false
        };

        let question = dns.Question({
            name: 'www.google.com',
            type: 'A',
            cache: false
          });
          
          let start = new Date().getTime();
          
          var req = dns.Request({
            question: question,
            server: { address: server, port: 53, type: 'udp' },
            timeout: 5000,
          });
          
          req.on('timeout', function () {
            response.error = true;
          });
          
          req.on('message', function (err, answer) {
            answer.answer.forEach(function (a) {
              response.resolve = a.address;
            });
          });
          
          req.on('end', function () {
            var delta = (new Date().getTime()) - start;
            response.ms=delta;
            resolve(response);
          });
          
          req.send();
    })
}

async function isUp() {
    let keys = Object.keys(servers);
    if (++last > keys.length-1) last = 0;

    let server   = keys[last];
    let serverIp = servers[keys[last]][0];
    let response = await queryDNS(serverIp);
    var msg;    

    if (response.error) {
        failures++;
        msg = `${dateStamp()}: ${server} (${serverIp}) says you are ${!response.error==true?'ONLINE':'OFFLINE'} (failure ${failures}, Offline for ${Math.floor(failures*10/60)}m)`;
        fs.appendFileSync("offline.txt", msg + "\n");
    } else {
        failures = 0;
        msg = `${dateStamp()}: ${server} (${serverIp}) says you are ${!response.error==true?'ONLINE':'OFFLINE'} (${response.ms}ms)`;
    }

    console.log(msg);
    setTimeout(isUp, 10000);
}

console.log();
console.log('Am I ONLINE?, v1 - [Logging to: offline.txt]');
console.log('This queries DNS servers to determine if you are online.  One positive could mean the server is offline');
console.log('and may not mean that you are offline.  To be sure, multiple failures are the best indicator');
console.log();
isUp();
