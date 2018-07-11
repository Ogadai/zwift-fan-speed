const Gpio = require('./gpio');
const extend = require('extend');

class FanSpeed {
  constructor(config) {
    this.speed = 0;
    this.currentState = 0;

    this.settings = extend({
      min: 10,
      max: 50,
      scale: 1,
		  base: 0.2,
      pollInterval: 100,
      raw: { min: 0.2, max: 1 }
    }, config);

    if (Gpio) {
      this.gpio = new Gpio(config.gpio.pin, 'out');

            this.gnd = new Gpio(config.gpio.gnd, 'out');
            this.gnd.writeSync(0);

            this.onTimeout(0);
    }
  }

  getFanSpeed(speed, speedType) {
    const option = (speedType && this.settings[speedType]) ? this.settings[speedType] : this.settings;
    if (speed > option.max) speed = option.max;
    if (speed < option.min) speed = option.min;

    const scale = option.scale || this.settings.scale;
    const base = option.base || this.settings.base;

    let scaledSpeed = Math.pow((speed - option.min), scale)
      / Math.pow((option.max - option.min), scale);

	    if (scaledSpeed < base) {
		    scaledSpeed = scaledSpeed < base / 2 ? 0 : base;
	    }

    return Math.round(scaledSpeed * 100) / 100;
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

  setState(speed, speedType) {
    this.speed = speed;
    this.currentState = this.getFanSpeed(speed, speedType);
    if (!this.gpio) {
      console.log(`Fan speed ${this.currentState}`);
    }
    return this.currentState;
  }

  getState() {
    return { speed: this.speed, fan: this.currentState };
  }

  disconnect() {
    this.speed = 0;
    if (!this.gpio) {
      this.gpio.unexport();
      this.gpio = null;
            this.gnd.unexport();
            this.gnd = null;
    }
  }
}
module.exports = FanSpeed;
