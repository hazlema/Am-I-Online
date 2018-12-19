const ansi = require('ansi')
const cursor = ansi(process.stdout)
const dns = require('native-dns');
const fs = require('fs');

var failures = 0;
var warnings = 0;
var lastHost = -1;
var servers  = JSON.parse(fs.readFileSync('servers.json'));

function dateStamp() {
	var event = new Date();
	return (
		event
			.toISOString()
			.slice(0, 10)
			.trim() +
	    ' ' +
		event
			.toTimeString()
			.slice(0, 8)
			.trim()
	);
}

function queryDNS(server) {
	return new Promise(function(resolve) {
		let response = {
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
			timeout: 5000
		});

		req.on('timeout', function() {
			response.error = true;
		});

		req.on('message', function(err, answer) {
			answer.answer.forEach(function(a) {
				response.resolve = a.address;
			});
		});

		req.on('end', function() {
			var delta = new Date().getTime() - start;
			response.ms = delta;
			resolve(response);
		});

		req.send();
	});
}

function random(arr) {
	let len = arr.length;
	let rnd = Math.floor(Math.random() * len);
	return arr[rnd];
}

async function isUp() {
	let keys = Object.keys(servers);
	if (++lastHost > keys.length - 1) lastHost = 0;

	let server   = keys[lastHost];
	let serverIp = random(servers[keys[lastHost]]);
    let response = await queryDNS(serverIp);

    let ms      = response.ms + 'ms';
    let status  = 'ONLINE';
    let offTime = '0m';

    if (response.error) {
        failures+=1;

        status = 'OFFLINE';
        offTime = `${ Math.floor((failures * 10) / 60) }m`;
    
        csv = `${dateStamp()}, ${server}, ${serverIp}, ${status}, ${failures}, ${offTime}`;
    } else {
        failures = 0;

        if (response.ms > 1000) {
            warnings += 1;
            status = 'SLOW';
        } else {
            warnings = 0;
        }

        csv = `${dateStamp()}, ${server}, ${serverIp}, ${status}, ${warnings}, ${ms}`;
    }

    fs.appendFileSync('offline.csv', csv + `\n`);

    cursor
        .brightBlack()
        .write('[')
        .brightYellow()
        .write(dateStamp())
        .brightBlack()
        .write(']: ')
        .brightCyan()
        .write(`${server}`)
        .brightBlack()
        .write('/')
        .brightCyan()
        .write(`${serverIp}`)
        .brightWhite()
        .write(' says you are ')

        if (status == 'ONLINE') cursor.brightGreen().write(`Online (${ms})`);
        if (status == 'OFFLINE') cursor.brightRed().write(`Offline (Failures: ${failures}, Offline: ${offTime})`);
        if (status == 'SLOW') cursor.brightMagenta().write(`Slow (Warnings: ${warnings}, Milliseconds: ${ms})`);

        cursor
            .write('\n')
            .fg.reset();

    setTimeout(isUp, 10000);
}

cursor.brightBlack();
console.log();
console.log('-------------------------------------------------------------------------------------------------------');
cursor.brightWhite();
console.log('This queries DNS servers to determine if you are online.  One positive could mean the server is offline');
console.log('and may not mean that you are offline.  To be sure, multiple failures are the best indicator');
cursor.brightBlack();
console.log('-------------------------------------------------------------------------------------------------------');
console.log();

isUp();

