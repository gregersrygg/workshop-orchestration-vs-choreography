var express = require('express');
var http = require('http');
var request = require('good-guy-http')({timeout: 5000});
var bodyParser = require('body-parser');
var Chance = require('chance');
var chance = new Chance();
var _ = require('lodash');
var iron_mq = require('iron_mq');
var imq = new iron_mq.Client({
    host: 'mq-aws-eu-west-1-1.iron.io',
    token: 'xxx',
    project_id: '56a9e5034826aa000600019c',
    queue_name: 'gregers_push_queue'}
);
var queue = imq.queue('gregers_push_queue');

var app = express();
app.use(bodyParser.text()); // it means that we're getting plain/text content type

var server = http.createServer(app);

app.get('/', function (req, res) {
    res.status(200).json({hello: 'world'});
});

//https://mq-aws-eu-west-1-1.iron.io/3/projects/56a9e5034826aa000600019c/queues/gregers_push_queue/webhook?oauth=5kGsQJigQ3Q6ypk6fXYR

app.post('/customerService/customer', function (req, res, next) {
    var id = chance.guid();
    var customerRecord = {
        payload: {
            id,
            name: chance.name(),
            address: chance.address(),
            phone: chance.phone({ country: 'no' }),
            email: chance.email()
        }
    };

    console.log('New customer record created ' + JSON.stringify(customerRecord));
    queue.post(JSON.stringify(customerRecord), function(error, body) {
        if (error) {
            console.error(error);
            next(error);
        }
        console.log('Done!', body);
    });

    /*const postOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(customerRecord)
    };

    const allRequests = Promise.all(
        ['/loyaltyPointsBank/balance', '/postService/welcomePack', '/emailService/email']
        .map(path => `http://localhost:3000${path}`)
        .map(fullURL => Object.assign({ url: fullURL }, postOpts))
        .map((options) => request(options))
    );

    allRequests.then(() => {
        console.log('Done!');
    }).catch(next);
    */
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

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal server error');
});

server.listen(3000, function() {
    console.log('http://localhost:3000');
});
