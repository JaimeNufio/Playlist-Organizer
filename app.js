var express = require('express'); // Express web server framework

var app = express();

app.use(express.static(__dirname + '/public'));



console.log('Listening on 5000');
app.listen(process.env.PORT || 5000)//.listen(8080);