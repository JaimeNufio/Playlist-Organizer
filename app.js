var express = require('express'); // Express web server framework

var app = express();

app.use(express.static(__dirname + '/public'));



console.log('Listening on 80');
app.listen(80);