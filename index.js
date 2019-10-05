var http = require('http');
var fs = require('fs');
var path = require('path');
var chatserver = require('./server/chat_server');


var mime = require('mime-types');
var cache = {};

var server = http.createServer(function(request, response) {
    var filePath = false;
console.log('url destined',request.url)
    if (request.url == '/') {
        filePath = 'lib/index.html';
    } else {
        filePath = 'lib' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

chatserver.listen(server);

server.listen(3000, function() {
    console.log('Server listening on 3000');
});

function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: Resource not found');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(200,{"content-type": mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}