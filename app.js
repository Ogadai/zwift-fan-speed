const ZwiftAccount = require('zwift-mobile-api')
const FanSpeed = require('./devices/fan-speed');
const settings = require('./settings');
const server = require('./server');

const account = new ZwiftAccount(settings.username, settings.password);

let interval,
    playerProfile,
    fanSpeed,
    errorCount

startWaitPlayer();

function startWaitPlayer() {
    startInterval(checkPlayerStatus, settings.statusInterval || 10000);
}

function startMonitorSpeed(profile) {
    console.log('Start monitoring rider speed');
    playerProfile = profile
    fanSpeed = new FanSpeed(settings.fan);
    errorCount = 0;

    startInterval(checkPlayerSpeed, settings.interval || 2000);
}

function startInterval(callbackFn, timeout) {
    if (interval) clearInterval(interval);
    interval = setInterval(callbackFn, timeout);
    callbackFn();
}

function checkPlayerStatus() {
    account.getProfile(settings.player).profile()
        .then(profile => {
            if (profile.riding) {
                console.log(`Player ${settings.player} has started riding`);
                startMonitorSpeed(profile);
            } else {
                console.log(`Player ${settings.player} is not riding`);
            }
        })
        .catch(err => {
            console.log(`Error getting player status: ${err.response.status} - ${err.response.statusText}`);
        });
}

function checkPlayerSpeed() {
    account.getWorld(playerProfile.worldId).riderStatus(settings.player)
        .then(status => {
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
    errorCount++;
    if (errorCount >= 3) {
        startWaitPlayer();
    }
}
