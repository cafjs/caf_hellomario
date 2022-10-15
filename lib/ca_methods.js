'use strict';
const assert = require('assert');
const caf = require('caf_core');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const app = require('../public/js/app.js');

const APP_SESSION = 'default'; //main app
const STANDALONE_SESSION = 'standalone'; //main app in standalone mode
const IOT_SESSION = 'iot'; // device
const USER_SESSION = /^user/; // third-party app
const CHANNEL_NAME = 'marioEvents';

 // sort & merge events, then update views
const updateImpl = (self, marioEvents) => {

    notifyWebApps(self, 'New events');
};

const notifyIoT = function(self, msg) {
    self.$.session.notify([msg], IOT_SESSION);
};

const notifyWebApps = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
    self.$.session.notify([msg], STANDALONE_SESSION);
    self.$.session.notify([msg], USER_SESSION);
};

const doBundle = function(self, command, ...args) {
    const bundle = self.$.iot.newBundle();
    bundle[command](0, args);
    self.$.iot.sendBundle(bundle, self.$.iot.NOW_SAFE);
    notifyIoT(self, command);
};

exports.methods = {
    // Methods called by framework
    async __ca_init__() {
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();

        // methods called by the iot device
        this.state.trace__iot_sync__ = '__ca_traceSync__';

        this.state.error = null;
        this.state.isConnected = false;
        this.state.linkedTo = null;
        this.state.myChannel = caf.joinName(this.__ca_getName__(),
                                            CHANNEL_NAME);

        this.$.security.addRule(this.$.security.newSimpleRule(
            '__ca_handleMarioEvents__' // anybody, but no external calls
        ));

        return [];
    },

    async __ca_handleMarioEvents__(pubSubTopic, message) {
        if (pubSubTopic === this.state.linkedTo) {
            // Array<{timestamp, topic, obj}>
            const marioEvents = JSON.parse(message);
            // sort & merge events, then update views
            updateImpl(this, marioEvents);
        }
        return [];
    },

    async __ca_pulse__() {
        this.$.log && this.$.log.debug('Calling PULSE!');
        this.$.react.render(app.main, [this.state]);
        return [];
    },

    //External methods

    async hello(key, tokenStr) {
        tokenStr && this.$.iot.registerToken(tokenStr);
        key && this.$.react.setCacheKey(key);
        return this.getState();
    },

    async follow(target) {
        assert(caf.splitName(target).length === 2);
        const oldTopic = this.state.linkedTo;
        const newTopic = caf.joinName(target, CHANNEL_NAME);
        if (oldTopic !== newTopic) {
            this.state.linkedTo = newTopic;
            this.$.pubsub.subscribe(newTopic, '__ca_handleMarioEvents__');
            oldTopic && this.$.pubsub.unsubscribe(oldTopic);
        }
        return this.getState();
    },

    async unfollow() {
        this.state.linkedTo && this.$.pubsub.unsubscribe(this.state.linkedTo);
        this.state.linkedTo = null;
        return this.getState();
    },

    async connect() {
        doBundle(this, 'connect', this.$.props.legoDeviceTypes);
        return this.getState();
    },


    async disconnect(force) {
        doBundle(this, 'disconnect');
        if (force) {
            this.state.isConnected = false;
            notifyWebApps(this, 'Force disconnect');
        }
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },

    // Methods called by the IoT device


    async pushEvents(pending) { // Array<{timestamp, topic, obj}>
        this.$.pubsub.publish(this.state.myChannel, JSON.stringify(pending));
        // sort & merge events, then update views
        updateImpl(this, pending);
        return [];
    },

    async setError(err) {
        this.state.error = err;
        return [];
    },

    // called when the device syncs state with the cloud
    async __ca_traceSync__() {
        const $$ = this.$.sharing.$;
        this.$.log.debug(`${this.state.fullName} :Syncing!!: ${Date.now()}`);
        const temp = this.state.isConnected;
        this.state.isConnected = $$.toCloud.get('isConnected');

        if (temp !== this.state.isConnected) {
            notifyWebApps(this, 'New inputs');
        }
        return [];
    }

};

caf.init(module);
