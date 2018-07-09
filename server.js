const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const settings = require('./settings');
const port = settings.port || 3000;

let fanSpeed = null;
let fanApp = null;

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

app.options('/status', function (req, res) {
  sendJson(res);
});
app.get('/status', function (req, res) {
  sendJson(res, fanApp.getStatus());
})
app.post('/status', function (req, res) {
  const status = req.body;
  fanApp.setStatus(status);
  sendJson(res, fanApp.getStatus());
})

app.use(express.static(`${__dirname}/public`))

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
  res.status(200).send(data)
}

function setFanSpeed(fan, app) {
  fanSpeed = fan;
  fanApp = app;
}

module.exports = {
  setFanSpeed
};
