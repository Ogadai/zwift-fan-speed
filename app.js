const ZwiftAccount = require('zwift-mobile-api'),
    FanSpeed = require('./devices/fan-speed'),
    LED = require('./devices/led'),
    settings = require('./settings'),
    server = require('./server');

const account = new ZwiftAccount(settings.username, settings.password),
      led = new LED(settings.led);

let interval,
    playerProfile,
    fanSpeed = new FanSpeed(settings.fan),
    errorCount

server.setFanSpeed(fanSpeed);
startWaitPlayer();

function startWaitPlayer() {
    startInterval(checkPlayerStatus, settings.statusInterval || 10000);
}

function startMonitorSpeed(profile) {
    console.log('Start monitoring rider speed');
    playerProfile = profile
    errorCount = 0;

    startInterval(checkPlayerSpeed, settings.interval || 2000);
}

function startInterval(callbackFn, timeout) {
    if (interval) clearInterval(interval);
    interval = setInterval(callbackFn, timeout);
    callbackFn();
}

function checkPlayerStatus() {
    led.setState('off');
    account.getProfile(settings.player).profile()
        .then(profile => {
            led.setState('on');

            if (profile.riding) {
                console.log(`Player ${settings.player} has started riding`);
                startMonitorSpeed(profile);
            } else {
                console.log(`Player ${settings.player} is not riding`);
            }
        })
        .catch(err => {
            led.setState('error');
            console.log(`Error getting player status: ${err.response.status} - ${err.response.statusText}`);
        });
}

function checkPlayerSpeed() {
    led.setState('on');
    account.getWorld(playerProfile.worldId).riderStatus(settings.player)
        .then(status => {
            led.setState('off');

            if (!status || status.speed === undefined) {
                console.log('Invalid rider status');
                speedCheckError();
            } else {
                errorCount = 0;
                const speedkm = Math.round((status.speed / 1000000));
                console.log(`Distance: ${status.distance}, Time: ${status.time}, Speed: ${speedkm}km/h, Watts: ${status.power}w`);

                fanSpeed.setState(speedkm);
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
