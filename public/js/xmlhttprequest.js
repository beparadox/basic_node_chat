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
var BAMNodeChat = {};
BAMNodeChat.utils = {};
BAMNodeChat.utils.ajax = (function() {
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
        console.log(obj);

        if (!obj.url || typeof obj.url !== 'string') {
            throw new TypeError();
        } else {
            options.url = obj.url;
        }

        if (obj.method && typeof obj.method === 'string') {
            options.method = obj.method.toUpperCase();

            if (options.method === "POST" && !obj.data) {
                throw new TypeError('missing data for POST request');
            } else {
                if (typeof obj.data === "object") {
                    options.data = JSON.stringify(obj.data);
                } else {
                    options.data = obj.data;

                }
            }
        }

        if (obj.headers && typeof obj.headers === "object") {
            options.headersFlag = true;
            options.headers = obj.headers;
        }

        if (obj.beforeSend && typeof obj.beforeSend === 'function') {
            options.beforeSend = obj.beforeSend;
        }

        if (obj.success && typeof obj.success === 'function') {
            options.success = obj.success;
        }

        if (obj.complete && typeof obj.complete === 'function') {
            options.complete = obj.complete;
        }

    }

    ajax = function(obj) {
        var request;
        request = new XMLHttpRequest();

        verifyOptions(obj);
        console.log(options);

        request.open(options.method, options.url);

        if (options.headersFlag) {
            for (var i in options.headers) {
                request.setRequestHeader(i, options.headers[i]);
            }
        }

        if (options.beforeSend && typeof options.beforeSend === 'function') {
            options.beforeSend();
        }

        request.onreadystatechange = function() {
            var type;

            switch (request.readyState) {
                case 0:
                    console.log("request.open has not yet been called");
                    break;
                case 1:
                    console.log("request.open has been called");
                    break;
                case 2:
                    console.log("response headers have been received");
                    break;
                case 3:
                    console.log("response body is being received");
                    break;
                case 4:
                    console.log("response is complete");
                    type = request.getResponseHeader("Content-Type");
                    console.log(type);
                    options.success(request.responseText);
                    break;
                    //TODO: call success function if available
                    //  call complete function if available
                default:
                   console.log("unknown value for response.readyState");
                   break;
            }
        };

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
