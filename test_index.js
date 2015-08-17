var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 6050));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/test'));
app.use(express.static(__dirname + '/bower_components'));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
