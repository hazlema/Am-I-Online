const ansi = require('ansi');
const cursor = ansi(process.stdout);
const dns = require('native-dns');
const fs = require('fs');

var failures = 0;
var warnings = 0;
var lastHost = -1;
var servers = JSON.parse(fs.readFileSync('servers.json'));

function logFile() {
	var event = new Date();
	var name =
		event
			.toISOString()
			.slice(0, 10)
			.trim()
			.replace(/-/g, '') + '-online.csv';

	if (!fs.existsSync(name)) fs.appendFileSync(name, 'Date/Time, Server, IP, Status, Errors, ms/min\n');

	return name;
}

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
			timeout: 10000
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

function colorize(display) {
	let charIndex = 0;
	while (charIndex <= display.length - 1) {
		let char = display[charIndex];

		if (char == '^') {
			let nextChar = display[charIndex + 1];

			switch (nextChar) {
				case 'b':
					cursor.brightBlack();
					charIndex++;
					break;
				case 'c':
					cursor.brightCyan();
					charIndex++;
					break;
				case 'w':
					cursor.brightWhite();
					charIndex++;
					break;
				case 'g':
					cursor.brightGreen();
					charIndex++;
					break;
				case 'r':
					cursor.brightRed();
					charIndex++;
					break;
				case 'm':
					cursor.brightMagenta();
					charIndex++;
					break;
				case 'y':
					cursor.brightYellow();
					charIndex++;
					break;
				default:
					cursor.write(char);
			}
		} else {
			cursor.write(char);
		}

		charIndex++;
	}

	cursor.write('\n').fg.reset();
}

async function isUp() {
	let keys = Object.keys(servers);
	if (++lastHost > keys.length - 1) lastHost = 0;

	let server = keys[lastHost];
	let serverIp = random(servers[keys[lastHost]]);
	let response = await queryDNS(serverIp);

	let ms = response.ms + 'ms';
	let status = 'ONLINE';
	let offTime = '0m';

	if (response.error) {
		failures += 1;

		status = 'OFFLINE';
		offTime = `${Math.floor((failures * 10) / 60)}m`;

		csv = `${dateStamp()}, ${server}, ${serverIp}, ${status}, ${failures}, ${offTime}`;
	} else {
		failures = 0;

		if (response.ms > 1000) {
			warnings += 1;
			if (response.ms > 2000) {
				status = 'VERY SLOW';
			} else {
				status = 'SLOW';
			}
		} else {
			warnings = 0;
		}

		csv = `${dateStamp()}, ${server}, ${serverIp}, ${status}, ${warnings}, ${ms}ms`;
	}

	var output = `^b[^w${dateStamp()}^b]: ^c${server}^b/^c${serverIp}^w says you are `;
	if (status == 'ONLINE') output += `^gOnline ^b(^w${ms}^b)`;
	if (status == 'OFFLINE') output += `^rOffline ^b(^rFailures^b:^w ${failures}^b,^r Offline for^b:^w ${offTime}^b)`;
	if (status == 'VERY SLOW') output += `^mVery Slow ^b(^mWarnings^b:^w ${warnings}^b,^m Milliseconds^b:^w ${ms}^b)`;
	if (status == 'SLOW') output += `^ySlow ^b(^yWarnings^b:^w ${warnings}^b,^y Milliseconds^b:^w ${ms}^b)`;

	colorize(output);
	fs.appendFileSync(logFile(), csv + `\n`);

	setTimeout(isUp, 10000);
}

cursor.brightBlack();
colorize('^b-[ ^wAm ^gI ^wONLINE? ^b]--------------------------------------------------------------------------------------');
console.log();
colorize('^wThis utility queries multiple ^mDNS servers^w to determine if you are online.  ^wOne positive could mean the');
colorize('^rserver is offline or slow ^wand may not mean that ^ryou are offline or slow.');
console.log();
colorize('^w** ^yTo be sure, multiple failures are the best indicator ^w**');
console.log();
isUp();
