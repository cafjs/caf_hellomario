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
        const renderOneRow = (event, i) =>
           cE('tr', {key:10*i},
              [
                  cE('td', {key:10*i+1}, event.timestamp),
                  cE('td', {key:10*i+2}, event.source),
//                  cE('td', {key:10*i+3}, event.topic),
                  cE('td', {key:10*i+4}, JSON.stringify(event.obj))
              ]);

        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                         cE('th', {key:2}, 'Time'),
                         cE('th', {key:5}, 'Source'),
//                         cE('th', {key:6}, 'Topic'),
                         cE('th', {key:8}, 'Data')
                       )
                    ),
                  cE('tbody', {key:9}, (this.props.marioEvents || [])
                     .map((x, i) => renderOneRow(x, i))
                    )
                 );
    }

}

module.exports = MarioEvents;
