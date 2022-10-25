'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const url = require('url');

class Manage extends React.Component {
    constructor(props) {
        super(props);

        this.disconnect = this.disconnect.bind(this);
        this.spawnTab = this.spawnTab.bind(this);
    }

    disconnect() {
        if (!this.props.inIFrame) {
            AppActions.setLocalState(this.props.ctx, {displayDisconnect: true});
            AppActions.disconnect(this.props.ctx, false);
        } else {
            // forced disconnect, even when the IoT bridge is missing...
            AppActions.disconnect(this.props.ctx, true);
        }
    }

    spawnTab() {
        if (typeof window !== 'undefined') {
            const parsedURL = url.parse(window.location.href);
            delete parsedURL.search; // no cache
            parsedURL.hash = parsedURL.hash.replace('session=default',
                                                    'session=standalone');
            if (parsedURL.host.endsWith('vcap.me')) {
                /* Web Bluetooth can only be used with https or localhost.
                 * Chrome allows subdomains in localhost, i.e.,
                 * root-helloiot.localhost, and with local debugging the app
                 * is also exposed on host port 3003 by default.
                 *
                 * Chrome tools can also proxy the port 3003 of my laptop to a
                 * USB connected Android phone, and then we can locally debug
                 * both Web Bluetooth and AR with WebXR, while they run in the
                 * phone...
                 */
                parsedURL.host = parsedURL.host.replace('vcap.me',
                                                        'localhost:3003');
            }
            window.open(url.format(parsedURL));
        }
    }

    render() {
        if (this.props.isConnected) {
            return  cE(rB.Form, {horizontal: true},
                       cE(rB.FormGroup, {controlId: 'connection', key: 13},
                          cE(rB.Col, {sm: 3, xs: 12},
                             cE(rB.ControlLabel, null, 'Connection')
                            ),
                          cE(rB.Col, {smOffset: 6, sm: 3, xs: 12},
                             cE(rB.Button, {
                                 key: 32,
                                 bsStyle: 'danger',
                                 onClick: this.disconnect
                             }, 'Disconnect')
                            )
                         )
                      );
        } else {
            if (this.props.inIFrame) {
                return cE(rB.Button, {bsSize: 'large',
                                      bsStyle: 'danger',
                                      onClick: this.spawnTab},
                          'Spawn to Connect');
            } else {
                return cE('div', null); // Connect button in Daemon.js
            }
        }
    }
}

module.exports = Manage;
