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


    /**
     * @object {Object} controller - collection of methods     * and properties useful for running the application
     *
     */
    controller = {
        init: function() {
            model.init();
            view.init();
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
                /*view.appendTableRow([{
                    nick: model.nickname,
                    text: msg,
                    timestamp: new Date().getTime()
                }]);*/
                ajax(xhrOptions);
            } else {
                alert(this.errorMessages.msg);

            }
        },

        recvXHR: function() {
            console.log('in recvXHR');
            var xhrOptions = {
                method: "GET",
                url: "/recv",
                success: function(text) {
                    console.log(text);
                    var time = new Date().getTime();
                    model.updateSince(time);
                    view.appendTableRow(text.messages);
                    controller.recvXHR();
                },
                data: {
                    _: new Date().getTime(),
                    since: model.since,
                    id: model.id
                }
            };

            ajax(xhrOptions);
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
            this.initEvents();
        },

        displayTime: function(timestamp) {

        },

        appendTableRow: function(msgs) {
            console.log(msgs);
            var isArray = BAMNodeChat.utils.array.isArray,
            createTableRow;

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
                if (typeof msg.text === "undefined") {
                    tn3 = document.createTextNode("joined");
                    tr.setAttribute("class", "joined");
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
                    console.log(msg);
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

