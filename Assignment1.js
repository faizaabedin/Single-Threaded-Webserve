let net = require("net");
let fs = require("fs");
let readline = require("readline");
let args = require("minimist")(process.argv.slice(2));

let configFile = "myhttpd.conf";
var dir_path = "";
var fileName = ""
var currentInput = "";
var previousInput = "";
var fileTypes = [];

let date  = new Date().toString();

console.log("Starting server...");

net.createServer((socket) => {
	
	fs.readFile(configFile, "utf8" , (err, data) => {
		if (err) throw err;
		let content = data.split("\r")[0];
		dir_path = content.split(" ")[1];
		fileTypes = (data.split("\r")[1]).split(" ");
	});
	
	socket.on("end", () => {
		console.log("Connection terminated.");
	})
	
	socket.on("data", (data) => {
		try {
			processInput(data.toString(), socket);
		} catch (e) {
			console.log(e)
		}
	})
	
}).on("connection", (data) => {
	console.log("Connection established!");	
}).on("error", (err) => {
	console.error(err);
}).listen(args.p, () => {
	console.log("Listening on port: " + args.p);
});


function processInput(inputStr, socket) {
	if (inputStr == "\r\n" && previousInput == "\r\n") {
		
		currentInput += inputStr;
		
		processRequest(currentInput, socket);

		currentInput = "";
		previousInput = "";
		
	} else {
		currentInput += inputStr;
		previousInput = inputStr;
	}
}

function processRequest(inputStr, socket) {
	let request = inputStr.split("\r\n");
	let httpRequest = request[0].trim().split(" ");
	fileName = httpRequest[1];
	
	if (fileName.charAt(0) == '/' && (httpRequest[2].includes("HTTP/1.0") || httpRequest[2].includes("HTTP/1.1"))) { //checking to ensure the fileName includes a slash and has the correct HTTP version
		switch(httpRequest[0]) {
			case "GET": // return header of the file + file contents
				getFile(socket); 
				break;
			case "POST": // create file
				createFile(request, socket);
				break;
			case "HEAD": // return header of file
				getHead(socket);
				break;
			default: socket.write("HTTP/1.0 501 Not Implemented\n\n");
				socket.pipe(socket);
				break;	
		}
	} else {
		socket.write("HTTP/1.0 400 Bad Request\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
		socket.pipe(socket);
	}
}

function getFile(socket) {
	fs.readFile(dir_path + fileName, "utf8" , (err, data) => {

		if (data != undefined) {
			
			if (err) throw err;
			
			if (data.length != 0) {
				let response = "HTTP/1.0 200 OK\nContent-Length: " + data.length + "\nServer: pizza.scs.ryerson.ca\nConnection: close\nContent-Type: text/html; charset=utf-8\nDate: " + date.split(" (")[0] + "\nContent-Language: en-us\nLast-Modified: " + date.split(" (")[0];
				socket.write(response + "\n\n\n" + data + "\n\n");
			} else {
				socket.write("HTTP/1.0 403 No Read Permissions\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
			}
			socket.pipe(socket);
		} else {
			socket.write("HTTP/1.0 404 Not Found\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
			socket.pipe(socket);
		}
	});
}

function createFile(request, socket) {
	let data = "";
	let extension = fileName.split(".")[1];
	if (fileTypes.indexOf(extension) != -1) {
		try {
			if (request[1].split(" ")[1] > 0) {
				for (let i = 2; i < request.length - 3; i++) {
					if (data != undefined) data += request[i] + "\n";
				}
				
				fs.appendFile(dir_path + fileName, data.substr(0,request[1].split(" ")[1]), function (err) {
					if (err) throw err;
					let response = "HTTP/1.0 201 Created\nContent-Length: " + data.length + "\nServer: pizza.scs.ryerson.ca\nConnection: close\nContent-Type: text/html; charset=utf-8\nDate: " + date.split(" (")[0] + "\nContent-Language: en-us\nLast-Modified: " + date.split(" (")[0];
					socket.write(response + "\n\n\n" + fileName.substr(1) + " was successfully created!\n\n");
					socket.pipe(socket);
				});
			} else {
				socket.write("HTTP/1.0 400 Bad Request\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
			}
			socket.pipe(socket);
		} catch(e) {
			socket.write("HTTP/1.0 400 Bad Request\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
			socket.pipe(socket);
		}
	} else {
		socket.write("HTTP/1.0 400 Bad Request\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
		socket.pipe(socket);
	}
	
}

function getHead(socket) {
	fs.readFile(dir_path + fileName, "utf8", (err, data) => {

		if (data != undefined) {
			
			if (err) throw err;
			
			if (data.length != 0) {
				let response = "HTTP/1.0 200 OK\nContent-Length: " + data.length + "\nServer: pizza.scs.ryerson.ca\nConnection: close\nContent-Type: text/html; charset=utf-8\nDate: " + date.split(" (")[0] + "\nContent-Language: en-us\nLast-Modified: " + date.split(" (")[0];
				socket.write(response + "\n\n");
			} else {
				socket.write("HTTP/1.0 403 No Read Permissions\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
			}
			socket.pipe(socket);
			
		} else {
			socket.write("HTTP/1.0 404 Not Found\nServer: pizza.scs.ryerson.ca\nConnection: close\nDate: " + date.split(" (")[0] + "\n\n");
			socket.pipe(socket);
		}
	});
}
