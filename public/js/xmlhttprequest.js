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
        headers: {},
        data: null
    };
 
    /**
     * a function to encode form data to be sent via XMLXttpRequest
     * From JavaScript: The Definitive Guide by David Flanigan, 6th Ed
     * Chapter 18
     * 
     *
     */
    function encodeFormData(data) {
        if (!data) return "";
        var pairs = [],
            value;
        for (var name in data) {
            if (!data.hasOwnProperty(name)) continue;
            if (typeof data[name] === 'function') continue;

            value = data[name].toString();
            name = encodeURIComponent(name).replace('%20', '+');
            value = encodeURIComponent(value).replace('%20', '+');
            pairs.push(name + "=" + value);
        }

        return pairs.join('&'); // return joined paris separated with &
    }

    function verifyOptions(obj) {
        console.log(obj);

        if (!obj.url || typeof obj.url !== 'string') {
            throw new TypeError();
        } else {
            options.url = obj.url;
        }

        if (obj.method && typeof obj.method === 'string') {
            options.method = obj.method.toUpperCase();
        } else {
            options.method = "GET";
        }

        if (options.method === "POST" && !obj.data) {
            throw new TypeError('missing data for POST request');
        } else {
            if (typeof obj.data === "object") {
                if (obj.dataType.toUpperCase() === "JSON") {
                    options.data = JSON.stringify(obj.data);
                    headers['Content-Type'] = 'application/json';
                } else { 
                    // encode data as if it's form encoded
                    options.data = encodeFormData(obj.data);
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            } else {
                // the data must be transferred as a string 
                options.data = obj.data.toString();
                headers['Content-Type'] = 'text/plain';
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
