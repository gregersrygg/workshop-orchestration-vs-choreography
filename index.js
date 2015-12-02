var express = require('express');
var http = require('http');
var request = require('good-guy-http')({timeout: 5000});
var bodyParser = require('body-parser');
var Chance = require('chance');
var chance = new Chance();
var _ = require('lodash');

var app = express();
app.use(bodyParser.text()); // it means that we're getting plain/text content type

var server = http.createServer(app);

app.get('/', function (req, res) {
    res.status(200).json({hello: 'world'});
});


app.post('/customerService/customer', function (req, res) {
    var id = chance.guid();
    var customerRecord = null; //TODO create a new record here

    console.log('New customer record created ' + JSON.stringify(customerRecord));


    // TODO: do service orchestration here


    res.status(202).json({status: 'pending'});
});

app.post('/loyaltyPointsBank/balance', function (req, res) {
    var body = JSON.parse(req.body);
    console.log('Loyalty points balance created for ' + body.payload.id);
    res.status(200).end();
});

app.post('/postService/welcomePack', function (req, res) {
    var body = JSON.parse(req.body);
    console.log('Welcome pack dispatched for ' + body.payload.id);
    res.status(200).end();
});

app.post('/emailService/email', function (req, res) {
    var body = JSON.parse(req.body);
    console.log('Welcome email sent for ' + body.payload.email);
    res.status(200).end();
});

server.listen(3000, function() {
    console.log("http://localhost:3000");
});