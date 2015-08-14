/**
 * Personal Ajax library for use with NodeChat
 * @author: Bambridge E. Peterson
 *
 * Various names for properties in object passed to 
 * the ajax function:
 *
 * method
 * dataType
 * error (cb)
 * beforeSend (function)
 * success (function)
 * url 
 * headers (headers to add)
 * data
 *
 *
 *
 */
var APP = {};
APP.ajax = (function() {
    var ajax,
    callbacks = [],
    options = {
        method: null,
        dataType: null,
        error: null,
        beforeSend: null,
        success: null,
        url: null,
        headersFlag: false,
        headers: null,
        data: null
    };

    function verifyOptions(obj) {

        if (!obj.url || typeof obj.url !== 'string') {
            throw new TypeError();
        } else {
            options.url = obj.url;
        }

        if (obj.method && typeof object.method === 'string') {
            options.method = obj.method.toUpperCase();

            if (options.method === "POST" && !obj.data) {
                throw new TypeError('missing data for POST request');
            }
        }
    }

    function setHeaders() {

    }

    ajax = function(obj) {
        var request;
        request = new XMLHttpRequest();

        verifyOptions(obj);

        request.open(options.method, options.url);
        if (options.headersFlag) {
            for (var i in options.headers) {
                request.setRequestHeader(i, options.headers[i]);
            }
        }

        if (options.beforeSend && typeof options.beforeSend === 'function') {
            options.beforeSend();
        }

        switch (options.method) {
            case 'GET':
                request.send(null);
                break;
            case 'POST':
                request.send(options.data);
                break;
            case 'PUT':
                request.send(options.data);
                break;
            default:
                console.log('Uncaught method:  ' + options.method);
                break;
        }

    };

    ajax.options = options;
    return ajax;
}());
