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

var sys = require('sys'),
    url = require('url'),
    qs = require('querystring');

var MESSAGE_BACKLOG = 200,
    SESSION_TIMEOUT = 60 * 1000;

var cs = exports;

function Channel() {
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
                sys.puts(nick + " join");
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

    this.query = function(since, callback) {
        var matching = [],
            message;

        for (var i = 0, l = messages.length; i < l; i += 1) {
            message = messages[i];
            if (message.timestamp > since)
                matching.push(message);
        }

        if (matching.length !== 0) {
            callback(matching);
        } else {
            callbacks.push({timestamp: new Date(), callback: callback});
        }
    };
}

cs.channel = new Channel();
cs.sessions = {};

cs.createSession = function (nick) {
    var session;
    if (nick.length > 50) return false;
    if (/[^\w_\-^!]/.exec(nick)) {
        console.log(nick + ' does not match the RE');
        return false;
    }

    for (var i in cs.sessions) {
        session = cs.sessions[i];
        if (session && session.nick === nick) return false;
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

    cs.sessions[session.id] = session;
    return session;
};

cs.who = function (req, res) {
    var nicks = [],
        sessions = cs.sessions,
        session;

    for (var id in sessions) {
        if (!sessions.hasOwnProperty(id)) continue;

        session = sessions[id];
        nicks.push(session.nick);
    }

    res.status(200).send({
        nicks: nicks,
        rss: mem.rss
    });
};

cs.join = function(req, res) {
    var nick = qs.parse(url.parse(req.url).query).nick,
        channel = cs.channel,
        session;

    if (typeof nick === 'undefined' || nick.length === 0) {
        res.status(400).send({error: 'Bad nickname.'});
        return;
    }

    session = cs.createSession(nick);
    if (!session) {
        res.status(400).send({error: "Nick in use"});
        return;
    }

    channel.appendMessage(session.nick, "join");
    res.status(200).send({
        id: session.id,
        nick: session.nick,
        rss: mem.rss,
        starttime: startTime
    });
};

cs.recv = function(req, res) {
    var id,
        session,
        sessions = cs.sessions,
        since,
        channel = cs.channel;

    if (!qs.parse(url.parse(req.url).query).since) {
        res.status(400).send({error: "Must supply since paramete"});
        return false;
    }

    if (!qs.parse(url.parse(req.url).query).id) {
        res.status(400).send({error: "Must supply id parameter"});
        return false;
    }

    since = parseInt(qs.parse(url.parse(req.url).query).since, 10);
    id = qs.parse(url.parse(req.url).query).id;

    if (id && sessions[id]) {
        session = sessions[id];
        session.poke();
    }

    channel.query(since, function(messages) {
        if (session) session.poke();
        res.status(200).json({
            messages: messages,
            rss: mem.rss
        });
    });
};

cs.send_post = function(req, res) {
    var data = qs.parse(url.parse(req.url).query),
        contentType = req.headers;

    sys.puts(contentType);

    for (var i in data) {
        sys.puts(i);
    }
    res.status(200).send(data);
};
