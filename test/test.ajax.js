var assert = chai.assert;
var ajax = BAMNodeChat.utils.ajax;
var form_data = [
    {
        "first": "Bam",
        "last": "Peterson"
    },
    { 
        "name": "Bam Peterson",
        "age": 36,
        "fat": false
    }
];

var ajax_requests = [
    {
        beforeSend: function() {
            console.log('beforeSend');
        },
        data: {
            name: 'Bamie',
            age: '36',
            nickname: 'Hamie'
        },
        error: function() {
            console.log('Error function');
        },
        method: 'POST',
        success: function(text) {
            console.log('Success!');
            console.alert(text);
        },
        url: '/send'
    },

    {
        data: {
            nick: 'Bamie'
        },
        url: '/send',
        method: 'POST',
        success: function(text) {
            alert(text);

        }
    }
];

describe("My own personal Ajax function, modeled after JQuery's ajax function", function() {
    describe("encodeURIComponent()", function() {
        it('should return "Bam+Peterson" from "Bam Peterson"', function() {
            assert.equal("Bam+Peterson", encodeURIComponent("Bam Peterson").replace('%20', '+'));
        });
    });

    describe("#encodeFormData()", function() {
        it('should return "first=Bam&last=Peterson" from form_data[0]', function() {
           assert.equal("first=Bam&last=Peterson", ajax.encodeFormData(form_data[0]));
        });
        
        it('should return "name=Bam+Peterson&age=36&fat=false" from form_data[1]', function() {
           assert.equal("name=Bam+Peterson&age=36&fat=false", ajax.encodeFormData(form_data[1]));
        });
    });

    describe("ajax()", function() {
        ajax(ajax_requests[1]);
    });


});
