const Gpio = require('./gpio');

class LED {
    constructor(config) {
        this.interval = null;

        if (Gpio && config) {
            this.gpio = new Gpio(config.gpio.pin, 'out');
        }
    }

    setState(state) {
        if (this.gpio) {
            this.clearError();

            if (state === 'error') {
                this.setError();
            } else {
                this.gpio.writeSync(state === 'on' ? 1 : 0);
            }
        } else {
//            console.log(`LED: ${state}`);
        }
    }

    clearError() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    setError() {
        let ledOn = false;
        this.interval = setInterval(() => {
            ledOn = !ledOn;
            this.gpio.writeSync(ledOn ? 1 : 0);
        }, 250);
    }

    disconnect() {
        clearError();
        if (!this.gpio) {
            this.gpio.unexport();
            this.gpio = null;
        }
    }
}
module.exports = LED;
