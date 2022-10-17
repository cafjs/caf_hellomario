'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class MarioEvents extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1}, [
                         cE('th', {key:2}, 'Time'),
                         cE('th', {key:5}, 'Source'),
                         cE('th', {key:6}, 'OK'),
                         cE('th', {key:8}, '#CAs'),
                         cE('th', {key: 3}, 'No CDN'),
                         cE('th', {key:23}, 'Webhook'),
                         this.props.privileged ?
                             cE('th', {key:9}, 'U/D/M') :
                             null,
                         cE('th', {key:4}, 'Image'),
                         cE('th', {key:7}, 'Version')
                     ].filter((x) => !!x)
                       )
                    ),
                  cE('tbody', {key:8}, renderRows())
                 );
cE(rB.Grid, {fluid: true},
                  cE(rB.Row, null,
                     cE(rB.Col, {lg: 4, sm:6, xs:12},
                        led(0), led(1), led(2)
                       )
                    ),
                  cE(rB.Row, null,
                     cE(rB.Col, {lg: 4, sm:6, xs:12},
                        led(3), led(4), led(5)
                       )
                    ),
                  cE(rB.Row, null,
                     cE(rB.Col, {lg:4, sm:6, xs:12},
                        led(6), led(7), led(8)
                       )
                    )
                 );
    }

}

module.exports = MarioEvents;
