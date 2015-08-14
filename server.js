/* server.js file for Basic Node Chat 
 * Using the node_chat project as a reference
 *
 * @author: Bambridge E. Peterson
 * 
 */
HOST = null;
PORT = 8001;

// when the daemon started
var startTime = (new Date()).getTime();

var mem = process.memoryUsage();

setInterval(function() {
    mem = process.memoryUsage();
}, 10*1000);

var fu = require('./fu'),
    sys = require('sys'),
    url = require('url'),
    qs = require('querystring');


fu.get('/', function(req, res) {
    var body = '<html>' +
    '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
    '</head>' +
    '<body>' +
    '<h1>Sheeeeeeeit</h1>' +
    '</body>' +
    '</html>';

    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(body);
    res.end();
});

fu.get('/route', function(req, res) {
        res.simpleText(200, 'The route');
});

var MESSAGE_BACKLOG = 200,
    SESSION_TIMEOUT = 60 * 1000;

var channel = new function() {
    var messages = [],
        callbacks = [];

    this.appendMessage = function(nick, type, text) {
        var m = {
            nick: nick,
            type: type,
            text: text,
            timestamp: (new Date()).getTime()
        };

        switch(type) {
            case "msg":
                sys.puts("<" + nick + "> " + text);
                break;
            case "join":
                sys.puths(nick + " join");
                break;
            case "part":
                sys.puts(nick + " part");
                break;
        }

        messages.push(m);

        while (callbacks.length > 0) {
            callbacks.shift().callback([m]);
        }

        while (messages.length > MESSAGE_BACKLOG) {
            messages.shift();
        }
    };
}();

var sessions = {};

function createSession(nick) {
    var session;
    if (nick.length > 50) return;
    if (/[\w_]/.exec(nick)) return;

    for (var i in sessions) {
        session = session[i];
        if (session && session.nick === nick) return;
    }

    session = {
        nick: nick,
        id: Math.floor(Math.random()*9999999999).toString(),
        timestamp: new Date(),

        poke: function() {
            session.timestamp = new Date();

        },

        destroy: function() {
            channel.appendMessage(session.nick, "part");
            delete sessions[session.id];
        }
    };

    sessions[session.id] = session;
    return session;
}

fu.listen(8020, 'localhost');
