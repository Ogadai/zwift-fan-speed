const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ZwiftAccount = require('zwift-mobile-api');
const settings = require('./settings');

const account = new ZwiftAccount(settings.username, settings.password);
let fanSpeed = null;

app.use(bodyParser.json());

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
  account.getWorld(worldId).riders().then(respondJson(res));
})

app.get('/status/', function (req, res) {
  var worldId = req.query.world || 1;
  var playerId = req.query.player || settings.player;
  account.getWorld(worldId).riderStatus(playerId).then(respondJson(res));
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
app.options('/fan', function (req, res) {
  sendJson(res);
});
app.get('/fan', function (req, res) {
  let result = {};
  if (fanSpeed) {
    result = fanSpeed.getState();
  }
  sendJson(res, result);
});
app.post('/fan', function (req, res) {
  let speed = req.body.speed,
    result = {};
  if (fanSpeed) {
    fanSpeed.setState(speed);
    result = fanSpeed.getState();
  }
  sendJson(res, result);
});

app.get('/profile', function (req, res) {
  var playerId = req.query.player || settings.player;
  account.getProfile(playerId).profile().then(respondJson(res));
})

app.use(express.static('node_modules/zwift-second-screen/public'))

app.listen(3000, function () {
  console.log(`Listening on port 3000!`)
})

function respondJson(res) {
  return function (data) {
    sendJson(res, data);
  }
}

function sendJson(res, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.send(data)
}

function asHtml(data) {
  return '<html><body><pre><code>' + JSON.stringify(data, null, 4) + '</code></pre></body></html>'
}

function setFanSpeed(fan) {
  fanSpeed = fan;
}

module.exports = {
  setFanSpeed
};
