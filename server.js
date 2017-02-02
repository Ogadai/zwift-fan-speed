const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ZwiftAccount = require('zwift-mobile-api');
const settings = require('./settings');
const port = settings.port || 3000;

const account = new ZwiftAccount(settings.username, settings.password);
let fanSpeed = null;

app.use(bodyParser.json());

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

app.use(express.static('node_modules/zwift-fan-speed-ui/public'))

app.listen(port, function () {
  console.log(`Listening on port ${port}!`)
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

function setFanSpeed(fan) {
  fanSpeed = fan;
}

module.exports = {
  setFanSpeed
};
