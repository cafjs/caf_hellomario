'use strict';

const myUtils = require('caf_iot').caf_components.myUtils;

const MARIO_EVENTS = ['pants', 'gesture', 'barcode'];

exports.methods = {
    async __iot_setup__() {
        this.state.pending = [];
        return [];
    },

    async __iot_loop__() {
        const isConnected = this.$.lego.isConnected();
        if (this.toCloud.get('isConnected') !== isConnected) {
            this.toCloud.set('isConnected', isConnected);
        }

        return [];
    },

    async __iot_handleEvent__(deviceType, topic, obj) {
        // Correct timestamp with offset

        // Queue

    },

    async connect(deviceTypes) {
        if (!this.$.lego.isConnected()) {
            await this.$.lego.connect(deviceTypes);

            MARIO_EVENTS.forEach(event => {
                this.$.lego.registerHandler(null, event, '__iot_handleEvent__');
            });

        }
        return [];
    },

    async disconnect() {
        MARIO_EVENTS.forEach(event => {
            this.$.lego.registerHandler(null, event, null);
        });
        await this.$.lego.disconnect();
        return [];
    }

};
