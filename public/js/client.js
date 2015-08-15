/* Client side handling for Basic Node Chat 
 * @author: Bambridge E. Peterson
 * */

BAMNodeChat.api = (function() {
    var api = {},
        model,
        controller,
        view,
        ajax = BAMNodeChat.utils.ajax;

    controller = {
        init: function() {
            console.log('controller init...');
            model.init();
            view.init();
        }
    };

    view = {
        init: function() {
            console.log('view init...');
            this.nickInput = document.getElementById('nickname');
            this.msgInput = document.getElementById('enter_message');
            this.submitButton = document.querySelector('button[name="submit_nickname"]');
            this.screenDims = document.getElementById('screen_dims');
            this.getScreenDims();

            this.initEvents();

        },

        getScreenDims: function() {
            var availWidth,
            availHeight;

            if (screen) {
                availWidth = screen.availWidth;
                availHeight = screen.availHeight;
            }
            this.screenDims.textContent = "avail: " + availWidth + ", " + availHeight +
                ' actual: ' + screen.width + ', ' + screen.height;

        },

        clearMsg: function() {
            this.msgInput.value = '';
        },

        initEvents: function() {
            var self = this;
            this.msgInput.addEventListener('keypress', function(e) {
                console.log(e);
                if (e.keyCode === 13) {
                    console.log(self.msgInput.value);
                    view.clearMsg.call(self);
                }
            });

            this.submitButton.addEventListener('click', function(e) {
                console.log(self.nickInput.value);
            });
        }
    };

    model = {
        init: function() {
            console.log('model init...');

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

