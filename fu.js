/*  fu.js file for Basic Node Chat */
var createServer = require("http").createServer;
var readFile = require("fs").readFile;
var sys = require("sys");
var url = require("url");
DEBUG = false;

var fu = exports;

var getMap = {};

var NOT_FOUND = "Not Found\n";

function notFound(req, res) {
    res.writeHead(404, {
        "Content-Type": "text/plain",
        "Content-Type": NOT_FOUND.length
    });
}

fu.get = function (path, handler) {
    getMap[path] = handler;
};

var server = createServer(function(req, res) {
    if (req.method === "GET" || req.method === "HEAD") {
        var handler = getMap[url.parse(req.url).pathname] || notFound; 

        res.simpleText = function(code, body) {
            res.writeHead(code, {
                "Content-Type": "text/plain",
                "Content-Length": body.lengt

            })
        };

        res.simpleJSON = function(code, obj) {
            var body = new Buffer(JSON.stringify(obj));
            res.writeHead(code, {
                "Content-Type": "text/json",
                "Content-Length": body.length
            });
            res.end(body);
        };

        handler(req, res);
    }
});

fu.listen = function(port, host) {
    server.listen(port, host);
    sys.puts("Server at http://" + (host || "127.0.0.1") + ":" + port.toString() + "/");
};

fu.close = function() {server.close(); };

