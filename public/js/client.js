/* Client side handling for Basic Node Chat 
 * @author: Bambridge E. Peterson
 * */

BAMNodeChat.api = (function() {
    var api = {},
        model,
        controller,
        view,
        ajax = BAMNodeChat.utils.ajax,
        timeout, 
        INTERVAL = 30,
        xhrJoin = {
            method: "POST",
            url: "/join",
            success: function(text) {
                if (text.error) {
                    alert(text.error);
                } else {
                    view.removeHeader();
                    model.initValues(text);
                    controller.recvXHR();
                }
            }
        };
    
    function memoryDisplay(rss) {
        var MB = 1048576,
            KB = 1024,
            mb = 'MB',
            kb = 'KB';
    }

    function timeDisplay(milliseconds) {
        var SECS = 60,
            MINS = 60,
            HOURS = 24,
            DAYS = 1;

    }

    /**
     * @object {Object} controller - collection of methods     * and properties useful for running the application
     *
     */
    controller = {
        init: function() {
            model.init();
            view.init();
            this.request = null;
        },

        errorMessages: {
            name: 'Names must be 2 to 20 chars, A-Za-z0-9_-',
            msg: 'Messages can be between 1 to 200 alphanumeric characters, with basic puncuation'
        },

        getViewElement: function(name) {
            return view.get(name);
        },

        sendJoinRequest: function(name) {
            if (model.validateNickname(name)) {
                xhrJoin.data = {
                    nick: name
                };
                ajax(xhrJoin);
            } else {
                alert(this.errorMessages.name);
            }
        },

        sendXHR: function(msg) {
            var data,
                xhrOptions = {
                    method: "POST",
                    url: "/send",
                    success: function(text) {
                        view.clearMsg();
                    }
                };
            if (model.validateMsg(msg)) {
                data = {
                    text: msg,
                    id: model.id
                };
                xhrOptions.data = data;
                ajax(xhrOptions);
            } else {
                alert(this.errorMessages.msg);

            }
        },

        recvXHR: function() {
            console.log('in recvXHR');
            var self = this;
            var xhrOptions = {
                method: "GET",
                url: "/recv",
                success: function(text, callback) {
                    var time = new Date().getTime();
                    model.updateSince(time);
                    if (text.messages.length > 0)
                        view.appendTableRow(text.messages);
                    else view.memory.innerHTML = "memory: " + text.rss;
                    callback();
                },
                complete: function() {
                    self.recvXHR();
                },
                data: {
                    _: new Date().getTime(),
                    since: model.since,
                    id: model.id
                }
            };

            this.request = ajax(xhrOptions);
            /*this.id = setTimeout(function() {
                if (self.request && self.request.readyState !== 4) {
                    self.request.abort();
                    self.recvXHR();
                }
            }, 30*1000);*/
        }
    };

    view = {
        init: function() {
            console.log('view init...');
            this.nickInput = document.getElementById('nickname');
            this.msgInput = document.getElementById('enter_message');
            this.submitButton = document.querySelector('button[name="submit_nickname"]');
            this.chatHeader = document.getElementById('chat_header');
            this.footer = document.getElementById('footer');
            this.table = document.getElementsByTagName('table')[0];
            this.users = document.getElementById('num_users');
            this.uptime = document.getElementById('uptime');

            this.memory = document.getElementById('memory');

            this.chatMessages = document.getElementById('chat_messages');
            this.initEvents();
        },

        appendTableRow: function(msgs) {
            var isArray = BAMNodeChat.utils.array.isArray,
            createTableRow,
            self = this;

            createTableRow = function(msg) {
                var tr,
                td, td2, td3,
                tn, tn2, tn3;
                tr = document.createElement('tr');
                td = document.createElement('td');
                td2 = document.createElement('td');
                td3 = document.createElement('td');
                tn2 = document.createTextNode(msg.nick);
                tn = document.createTextNode(new Date(msg.timestamp).toTimeString().split(" ")[0]);
                if (msg.type === "join") {
                    tn3 = document.createTextNode("joined");
                    tr.setAttribute("class", "joined");
                    model.users++;
                    view.users.innerHTML = (model.users > 1) ? model.users + " users" : model.users + " user";

                } else {
                    tn3 = document.createTextNode(msg.text);
                }
                td.appendChild(tn);
                td2.appendChild(tn2);
                td3.appendChild(tn3);
                tr.appendChild(td);
                tr.appendChild(td2);
                tr.appendChild(td3);
                this.table.appendChild(tr);
            };

            if (isArray(msgs)) {
                for (var i = 0, l = msgs.length; i < l; i +=1) {
                    createTableRow.call(this, msgs[i]);
                }
            } else {
                throw new TypeError('invalid type for appendTableRow');

            }

        },

        get: function(name) {
            if (name && this[name]) {
                return this[name];
            } else {
                throw new TypeError();
            }
        },

        clearMsg: function() {
            this.msgInput.value = '';
        },

        removeHeader: function() {
            this.nickInput.value = '';
            this.chatHeader.style.display = 'none';
            this.footer.style.display = 'block';
        },

        initEvents: function() {
            var self = this;
            this.msgInput.addEventListener('keypress', function(e) {
                var msg;
                if (e.keyCode === 13) {
                    msg = self.msgInput.value;
                    controller.sendXHR(msg);
                }
            });

            this.submitButton.addEventListener('click', function(e) {
                e.preventDefault();
                var nickname = self.nickInput.value;
                controller.sendJoinRequest(nickname); 
                console.log(self.nickInput.value);
            });
        }
    };

    model = {
        init: function() {
            console.log('model init...');
            this.id = null;
            this.nickname = null;
            this.created = null;
            this.rss = null;
            this.since = null;
            this.nameRE = /^[\w\-]{2,20}$/;
            this.msgRE = /^[\w\s\-!?',:;\.\(\)]{1,200}$/;
            this.users = 0;
        },

        validateNickname: function(name) {
            return this.nameRE.test(name) ? true: false;
        },

        validateMsg: function(msg) {
            return this.msgRE.test(msg) ? true: false;
        },

        initValues: function(text) {
            this.id = text.id;
            this.nickname = text.nick;
            this.rss = text.rss;
            this.created = text.starttime;
            this.since = text.starttime;
        },

        updateSince: function(time) {
            this.since = time;
        }
    };


    api.init = function() {
        console.log('initializing application...');
        controller.init();
    };
 
    api.methods = {
        controller: controller,
        model: model,
        view: view
    };    

    return api;
}());


document.addEventListener('DOMContentLoaded', function() {
    BAMNodeChat.api.init();
});

