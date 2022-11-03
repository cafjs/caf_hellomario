'use strict';

const myUtils = require('caf_iot').caf_components.myUtils;
const LUIGI = 'luigi'; // hubType
const MARIO = 'mario'; // hubType
const MARIO_PREFIX = '0.4.';
const LUIGI_PREFIX = '0.5.';

const findHubType = (props) => {
    if (!props) {
        return null;
    } else if (props.hardwareVersion.indexOf(MARIO_PREFIX) === 0) {
        return MARIO;
    } else  if (props.hardwareVersion.indexOf(LUIGI_PREFIX) === 0) {
        return LUIGI;
    } else {
        return null;
    }
};

exports.methods = {
    async __iot_setup__() {
        this.state.pending = []; // Array<{timestamp, hubType, topic, obj}>
        this.state.hubType = null;
        return [];
    },

    async __iot_loop__() {
        this.$.log && this.$.log.debug(`Loop: ${Date.now()}`);
        const isConnected = this.$.lego.isConnected();
        if (this.toCloud.get('isConnected') !== isConnected) {
            this.toCloud.set('isConnected', isConnected);
            if (!isConnected) {
                //clean up if accidentally disconnected
                await this.disconnect();
            }
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
                'Cannot perform Bluetooth operation, please REFRESH PAGE';

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
            const hubType = this.state.hubType;
            this.state.pending.push({timestamp, hubType, topic, obj});
        }
        return [];
    },

    async connect(deviceTypes) {
        if (!this.$.lego.isConnected()) {
            this.$.log && this.$.log.debug(`Connecting...`);
            await this.$.lego.connect(deviceTypes);
            const props = this.$.lego.getHubProps();
            this.$.log && this.$.log.debug(`${JSON.stringify(props)}`);
            this.state.hubType = findHubType(props);
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
        this.state.hubType = null;
        await this.$.lego.disconnect();
        return [];
    }
};
