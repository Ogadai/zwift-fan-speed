const ZwiftAccount = require('zwift-mobile-api'),
    FanSpeed = require('./devices/fan-speed'),
    LED = require('./devices/led'),
    settings = require('./settings'),
    server = require('./server');

const account = new ZwiftAccount(settings.username, settings.password),
      led = new LED(settings.led);

let interval,
    fanSpeed = new FanSpeed(settings.fan),
    errorCount,
    controlStatus = {
        riding: false,
        manual: false
    }

server.setFanSpeed(fanSpeed, {
    getStatus: () => Object.assign({ fan: fanSpeed.getState() }, controlStatus),
    setStatus: status => {
        controlStatus.manual = status && status.manual;
    }
});
startWaitPlayer();

function startWaitPlayer() {
    controlStatus.riding = false;
    startInterval(checkPlayerStatus, settings.statusInterval || 10000);
}

function startMonitorSpeed() {
    console.log('Start monitoring rider speed');
    errorCount = 0;
    controlStatus.riding = true;

    startInterval(checkPlayerSpeed, settings.interval || 2000);
}

function startInterval(callbackFn, timeout) {
    if (interval) clearInterval(interval);
    interval = setInterval(callbackFn, timeout);
    callbackFn();
}

function checkPlayerStatus() {
    led.setState('off');
    account.getWorld(1).riderStatus(settings.player)
        .then(() => {
            console.log(`Player ${settings.player} has started riding`);
            startMonitorSpeed();
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                console.log(`Player ${settings.player} is not riding`);
            } else {
                led.setState('error');
                console.log(`Error getting player status: ${err.response.status} - ${err.response.statusText}`);
            }
        });
}

function checkPlayerSpeed() {
    led.setState('on');
    account.getWorld(1).riderStatus(settings.player)
        .then(status => {
            led.setState('off');

            if (!status || status.speedInMillimetersPerHour === undefined) {
                console.log('Invalid rider status');
                speedCheckError();
            } else {
                errorCount = 0;
                const speedkm = Math.round((status.speedInMillimetersPerHour / 1000000));
                console.log(`Distance: ${status.totalDistanceInMeters}, Time: ${status.rideDurationInSeconds}, Speed: ${speedkm}km/h, Watts: ${status.powerOutput}w`);

                if (!controlStatus.manual) {
                    fanSpeed.setState(speedkm);
                }
            }
        })
        .catch(err => {
            console.log(`Error getting rider speed: ${err.response.status} - ${err.response.statusText}`);
            speedCheckError();
        });
}

function speedCheckError() {
    led.setState('error');
    errorCount++;
    if (errorCount >= 3) {
        fanSpeed.setState(0);
        startWaitPlayer();
    }
}
