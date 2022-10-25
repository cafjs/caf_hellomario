'use strict';

const myUtils = require('caf_iot').caf_components.myUtils;

exports.methods = {
    async __iot_setup__() {
        this.state.pending = []; // Array<{timestamp, topic, obj}>
        return [];
    },

    async __iot_loop__() {
        const isConnected = this.$.lego.isConnected();
        if (this.toCloud.get('isConnected') !== isConnected) {
            this.toCloud.set('isConnected', isConnected);
        }

        if (this.state.pending.length > 0) {
            // Correct timestamps with time offset
            const offset = this.$.cloud.cli &&
                  this.$.cloud.cli.getEstimatedTimeOffset();
            this.$.log && this.$.log.debug(`Offset: ${offset}`);
            this.state.pending.forEach(x => {
                x.timestamp = x.timestamp + offset;
            });
            this.$.log && this.$.log.debug(
                `Updates: ${JSON.stringify(this.state.pending)}`
            );

            await this.$.cloud.cli.pushEvents(this.state.pending).getPromise();

            this.state.pending = [];
        }

        return [];
    },

    async __iot_error__(err) {
        try {
            const now = Date.now();
            this.$.log && this.$.log.warn(now +  ': Got exception: ' +
                                          myUtils.errToPrettyStr(err));
            const serializableError = JSON.parse(myUtils.errToStr(err));
            serializableError.message = serializableError.error ?
                serializableError.error.message :
                'Cannot Perform Bluetooth Operation';

            await this.$.cloud.cli.setError(serializableError).getPromise();
            return [];
        } catch (err) {
            return [err];
        }
    },

    async __iot_handleEvent__(deviceType, topic, obj) {
        if ((topic == 'gesture') && (obj.gesture === 0)) {
            this.$.log && this.$.log.trace('Ignore gesture');
        } else {
            const timestamp = Date.now();
            this.state.pending.push({timestamp, topic, obj});
        }
        return [];
    },

    async connect(deviceTypes) {
        if (!this.$.lego.isConnected()) {
            await this.$.lego.connect(deviceTypes);

            this.$.props.marioEvents.forEach(event => {
                this.$.lego.registerHandler(null, event, '__iot_handleEvent__');
            });

        }
        return [];
    },

    async disconnect() {
        this.$.props.marioEvents.forEach(event => {
            this.$.lego.registerHandler(null, event, null);
        });
        await this.$.lego.disconnect();
        return [];
    }
};
