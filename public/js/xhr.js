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
    callbacks = [];
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
        var options = {
            method: null,
            dataType: null,
            url: null,
            functions: {
                error: null,
                beforeSend: null,
                success: null,
                complete: null
            },
            headersFlag: false,
            headers: {},
            data: null
        };

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
                if (obj.dataType && obj.dataType.toUpperCase() === "JSON") {
                    options.data = JSON.stringify(obj.data);
                    options.headers['Content-Type'] = 'application/json';
                    options.headersFlag = true;
                } else { 
                    // encode data as if it's form encoded
                    options.data = encodeFormData(obj.data);
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    options.headersFlag = true;
                }
            } else {
                // the data must be transferred as a string 
                options.data = obj.data.toString();
                headers['Content-Type'] = 'text/plain';
            }
        }

        if (obj.headers && typeof obj.headers === "object") {
            options.headersFlag = true;
            for (var i in obj.headers) {
                // TODO: copy obj.headers properties to options.headers
                // but, we don't want to override already set Content-Types
                if (!obj.headers.hasOwnProperty(i)) continue;
                if (i === 'Content-Type') continue;
                options.headers[i] = obj.headers[i];
            }
        }

        // set the possible functions to be called
        // options are as follows:
        //   beforeSend
        //   error
        //   success
        //   complete
        for (var j in options.functions) {
            if (!obj.hasOwnProperty(j)) continue;
            if (typeof obj[j] === 'function') {
                options.functions[j] = obj[j];
            }
        }

        return options;
    }

    ajax = function(obj) {
        var request,
            options;

        request = new XMLHttpRequest();

        options = verifyOptions(obj);

        request.open(options.method, options.url);

        if (options.headersFlag) {
            for (var i in options.headers) {
                request.setRequestHeader(i, options.headers[i]);
            }
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
                    type = request.getResponseHeader("Content-Type").split(';')[0];
                    console.log(type);
                    if (type === 'application/json') {
                        options.functions.success(request.responseText);
                    }
                    break;
                    //TODO: call success function if available
                    //  call complete function if available
                default:
                   console.log("unknown value for response.readyState");
                   break;
            }
        };

        if (options.functions.beforeSend) {
            options.functions.beforeSend();
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

    ajax.encodeFormData = encodeFormData;
    ajax.verifyOptions = verifyOptions;
    return ajax;
}());
