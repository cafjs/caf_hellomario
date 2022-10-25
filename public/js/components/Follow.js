'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class Follow extends React.Component {

    constructor(props) {
        super(props);
        this.edit = this.edit.bind(this);
    }

    edit() {
        AppActions.setLocalState(this.props.ctx, {displayEdit: true});
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                   cE(rB.FormGroup, {controlId: 'linkedTo', key: 12},
                      cE(rB.Col, {sm: 3, xs: 12},
                         cE(rB.ControlLabel, null, 'Following')
                        ),
                      cE(rB.Col, {sm: 6, xs: 12},
                         cE(rB.FormControl.Static, null,
                            this.props.linkedTo || 'NOBODY')
                        ),
                      cE(rB.Col, {sm: 3, xs: 12},
                         cE(rB.Button, {
                             bsStyle: 'primary',
                             key: 12,
                             onClick: this.edit
                         }, 'Edit')
                        )
                     )
                  );
    }
}

module.exports = Follow;
