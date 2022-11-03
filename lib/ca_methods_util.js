'use strict';
const caf = require('caf_core');

const APP_SESSION = 'default'; //main app
const STANDALONE_SESSION = 'standalone'; //main app in standalone mode
const IOT_SESSION = 'iot'; // device
const USER_SESSION = /^user/; // third-party app

 // sort & merge events, then update views
exports.updateImpl = (self, marioEvents, pubSubTopic) => {
    if (marioEvents && (marioEvents.length > 0)) {
        // Update hub type
        const hubType = marioEvents[0].hubType;
        if (pubSubTopic === self.state.myChannel) {
            self.state.myHubType = hubType;
        } else {
            self.state.linkedHubType = hubType;
        }
        // Update source
        const source = caf.joinName(...caf.splitName(pubSubTopic).slice(0, 2));
        marioEvents.forEach((x) => {x.source = source;});

        // Sort and truncate
        const all = [...self.state.marioEvents, ...marioEvents];
        self.state.marioEvents = all.sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, self.$.props.maxMarioEvents);

        notifyWebApps(self, 'New events');
    }
};

const notifyIoT = exports.notifyIoT = function(self, msg) {
    self.$.session.notify([msg], IOT_SESSION);
};

const notifyWebApps = exports.notifyWebApps = function(self, msg) {
    self.$.session.notify([msg], APP_SESSION);
    self.$.session.notify([msg], STANDALONE_SESSION);
    self.$.session.notify([msg], USER_SESSION);
};

exports.doBundle = function(self, command, ...args) {
    const bundle = self.$.iot.newBundle();
    bundle[command](0, args);
    self.$.iot.sendBundle(bundle, self.$.iot.NOW_SAFE);
    notifyIoT(self, command);
};
