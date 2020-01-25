let http = require('http');
let fs = require('fs');

let args = require('minimist')(process.argv.slice(2));

//args.p = port

//process file

http.createServer((req, res) => {
	let dotoffset = req.url.lastIndexOf('.')
	let mimetype = dotoffset == -1 ? 'text/plain' : 'text/html' [ req.url.substr(dotoffset) ];
	res.writeHead(200, {'Content-Type': mimetype});
  res.end(data);
}).listen(args.p);
