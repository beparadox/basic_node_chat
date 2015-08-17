var express = require('express');
var app = express();
var cs = require('./chatServer');

app.set('port', (process.env.PORT || 5050));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/who', cs.who); 

app.get('/recv', cs.recv);

app.post('/join', cs.join);

app.post('/send', cs.send); 

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
