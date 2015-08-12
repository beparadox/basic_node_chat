/* server.js file for Basic Node Chat 
 * Using the node_chat project as a reference
 *
 * @author: Bambridge E. Peterson
 * 
 */
HOST = null;
PORT = 8001;

// when the daemon started
var starttie = (new Date()).getTime();

var mem = process.memoryUsage();

setInterval(function() {
    mem = process.memoryUsage();
}, 10*1000);

var fu = require('./fu'),
    sys = require('sys'),
    url = require('url'),
    qs = require('querystring');

