const Gpio = require('./gpio');
const extend = require('extend');

function FanSpeed(config) {
    var self = this,
        gpio,
        currentState = 0,
        settings = extend({
            min: 10,
            max: 50,
            scale: 1,
            pollInterval: 100
        }, config);

	if (Gpio) {
		gpio = new Gpio(config.gpio.pin, 'out');
		onTimeout(0);

		this.disconnect = function () {
			gpio.unexport();
			gpio = null;
		}
	}

	function getFanSpeed(speedKm) {
        if (speedKm > settings.max) speedKm = settings.max;
        if (speedKm < settings.min) speedKm = settings.min;

        let speed = Math.pow((speedKm - settings.min), settings.scale)
            / Math.pow((settings.max - settings.min), settings.scale);

		return speed;
	}

	function onTimeout(outVal) {
		let nextTime = settings.pollInterval,
			nextVal = outVal;

		if (currentState === 0) {
			outVal = 0;
			nextVal = 0;
		}
		else if (currentState === 1) {
			outVal = 1;
			nextVal = 1;
		} else {
            nextTime = settings.pollInterval * ((outVal === 0) ? 1 - currentState : currentState);
			nextVal = 1 - outVal;
		}

		setTimeout(function () {
			onTimeout(nextVal);
		}, nextTime);

        if (gpio) {
            gpio.writeSync(outVal);
        }
	}

	self.setState = function (state) {
        currentState = getFanSpeed(state);
        if (!gpio) {
            console.log(`Fan speed ${currentState}`);
        }
	}
}
module.exports = FanSpeed;
