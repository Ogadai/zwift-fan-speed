const Gpio = require('./gpio');
const extend = require('extend');

class FanSpeed {
    constructor(config) {
        this.currentState = 0;

        this.settings = extend({
                min: 10,
                max: 50,
                scale: 1,
                pollInterval: 100
            }, config);

        if (Gpio) {
            this.onTimeout(0);
            this.gpio = new Gpio(config.gpio.pin, 'out');
        }
    }

	getFanSpeed(speedKm) {
        if (speedKm > this.settings.max) speedKm = this.settings.max;
        if (speedKm < this.settings.min) speedKm = this.settings.min;

        let speed = Math.pow((speedKm - this.settings.min), this.settings.scale)
            / Math.pow((this.settings.max - this.settings.min), this.settings.scale);

		return Math.round(speed * 100) / 100;
	}

	onTimeout(outVal) {
        let nextTime = this.settings.pollInterval,
			nextVal = outVal;

        if (this.currentState === 0) {
			outVal = 0;
			nextVal = 0;
		}
        else if (this.currentState === 1) {
			outVal = 1;
			nextVal = 1;
		} else {
            nextTime = this.settings.pollInterval * ((outVal === 0) ? 1 - this.currentState : this.currentState);
			nextVal = 1 - outVal;
		}

		setTimeout(() => this.onTimeout(nextVal), nextTime);

        if (this.gpio) {
            this.gpio.writeSync(outVal);
        } else {
            process.stdout.write(outVal.toString());
        }
	}

	setState(state) {
        this.currentState = this.getFanSpeed(state);
        if (!this.gpio) {
            console.log(`Fan speed ${this.currentState}`);
        }
        return this.currentState;
    }

    disconnect() {
        if (!this.gpio) {
            this.gpio.unexport();
            this.gpio = null;
        }
    }
}
module.exports = FanSpeed;
