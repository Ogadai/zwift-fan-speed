const express = require('express')
const app = express()
const ZwiftAccount = require('zwift-mobile-api')
const settings = require('./settings');

const account = new ZwiftAccount(settings.username, settings.password);
let fanSpeed = null;

//app.get('/followers/', function (req, res) {
//    var playerId = req.query.player || settings.player;
//    account.getProfile(playerId).followers().then(function (data) {
//        res.send(asHtml(data))
//    });
//})

//app.get('/followees/', function (req, res) {
//    var playerId = req.query.player || settings.player;
//    account.getProfile(playerId).followees().then(function (data) {
//        res.send(asHtml(data))
//    });
//})

app.get('/riders/', function (req, res) {
    var worldId = req.query.world || 1;
    account.getWorld(worldId).riders().then(function (data) {
        res.send(asHtml(data))
    });
})

app.get('/status/', function (req, res) {
    var worldId = req.query.world || 1;
    var playerId = req.query.player || settings.player;
    account.getWorld(worldId).riderStatus(playerId).then(function (data) {
        res.send(asHtml(data))
    });
})

//app.get('/json/', function (req, res) {
//    var path = req.query.path;
//    console.log(`Request: ${path}`);
//    account.getRequest().json(path)
//        .then(function (data) {
//            res.send(asHtml(data))
//        })
//        .catch(function (err) {
//            console.log(err.response);
//            res.status(err.response.status).send(`${err.response.status} - ${err.response.statusText}`);
//        });
//})

app.get('/fan/:speed', function (req, res) {
    let speed = req.params.speed,
        result = 0;
    if (fanSpeed) {
        result = fanSpeed.setState(speed);
    }

    res.send(`Fan speed set to ${result}`);
})

app.get('/', function (req, res) {
    var playerId = req.query.player || settings.player;
    account.getProfile(playerId).profile().then(function (data) {
        res.send(asHtml(data))
    });
})

app.listen(3000, function () {
    console.log(`Listening on port 3000!`)
})

function asHtml(data) {
    return '<html><body><pre><code>' + JSON.stringify(data, null, 4) + '</code></pre></body></html>'
}

function setFanSpeed(fan) {
    fanSpeed = fan;
}

module.exports = {
    setFanSpeed
};
