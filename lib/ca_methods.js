'use strict';
const assert = require('assert');
const caf = require('caf_core');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const app = require('../public/js/app.js');
const marioUtils = require('./ca_methods_util');

const CHANNEL_NAME = 'marioEvents';
const MARIO = 'mario'; // hubType

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
        this.state.myHubType = MARIO;
        this.state.linkedHubType = MARIO;

         // Array<{timestamp, source, hubType, topic, obj}>
        this.state.marioEvents = [];
        this.$.security.addRule(this.$.security.newSimpleRule(
            '__ca_handleMarioEvents__' // anybody, but no external calls
        ));

        return [];
    },

    async __ca_handleMarioEvents__(pubSubTopic, message) {
        if (pubSubTopic === this.state.linkedTo) {
            // Array<{timestamp,  hubType, topic, obj}>
            const marioEvents = JSON.parse(message);
            // sort & merge events, then update views
            marioUtils.updateImpl(this, marioEvents, pubSubTopic);
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
        marioUtils.doBundle(this, 'connect', this.$.props.legoDeviceTypes);
        return this.getState();
    },


    async disconnect(force) {
        marioUtils.doBundle(this, 'disconnect');
        if (force) {
            this.state.isConnected = false;
            marioUtils.notifyWebApps(this, 'Force disconnect');
        }
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    },

    // Methods called by the IoT device


    async pushEvents(pending) { // Array<{timestamp, hubType, topic, obj}>
        this.$.pubsub.publish(this.state.myChannel, JSON.stringify(pending));
        // sort & merge events, then update views
        marioUtils.updateImpl(this, pending, this.state.myChannel);
        return [];
    },

    async setError(err) {
        this.state.error = err;
        marioUtils.notifyWebApps(this, 'Update errors');
        return [];
    },

    // called when the device syncs state with the cloud
    async __ca_traceSync__() {
        const $$ = this.$.sharing.$;
        this.$.log.debug(`${this.state.fullName} :Syncing!!: ${Date.now()}`);
        const temp = this.state.isConnected;
        this.state.isConnected = $$.toCloud.get('isConnected');

        if (temp !== this.state.isConnected) {
            marioUtils.notifyWebApps(this, 'New inputs');
         }

        return [];
    }

};

caf.init(module);
