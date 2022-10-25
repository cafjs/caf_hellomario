'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const json_rpc = require('caf_transport').json_rpc;

class DisplayEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.state.following = '';
        this.doDismiss = this.doDismiss.bind(this);
        this.handleFollow = this.handleFollow.bind(this);
        this.doUpdate = this.doUpdate.bind(this);
        this.submit = this.submit.bind(this);
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {displayEdit: false});
    }

    handleFollow(e) {
        this.setState({following: e.target.value});
    }

    submit(ev) {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.doUpdate(ev);
        }
    }

    doUpdate(ev) {
        if (!this.state.following) {
            AppActions.unfollow(this.props.ctx);
            this.doDismiss();
        } else {
            if (json_rpc.splitName(this.state.following).length === 2) {
                AppActions.follow(this.props.ctx, this.state.following);
                this.doDismiss();
            } else {
                AppActions.setError(this.props.ctx, new Error(
                    'Invalid name: expected <user>-<name> , e.g.,' +
                        ' antonio-myMario'
                ));
            }
        }
    }

    render() {
        return cE(rB.Modal, {show: !!this.props.displayEdit,
                             onHide: this.doDismiss,
                             animation: false},
                  cE(rB.Modal.Header, {
                      className : 'bg-warning text-warning',
                      closeButton: true},
                     cE(rB.Modal.Title, null, 'Follow/Unfollow')
                    ),
                  cE(rB.ModalBody, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'linkedTo', key: 12},
                           cE(rB.Col, {sm: 4, xs: 12},
                              cE(rB.ControlLabel, null, 'Following')
                             ),
                           cE(rB.Col, {sm: 8, xs: 12},
                              cE(rB.FormControl.Static, null,
                                 this.props.linkedTo || 'Nobody')
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'newFollow', key: 42},
                           cE(rB.Col, {sm: 4, xs: 12},
                              cE(rB.ControlLabel, null, 'Target')
                             ),
                           cE(rB.Col, {sm: 8, xs: 12},
                              cE(rB.FormControl, {
                                  value: this.state.following,
                                  onChange: this.handleFollow,
                                  onKeyPress: this.submit
                              })
                             )
                          )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.ButtonGroup, null,
                        cE(rB.Button, {onClick: this.doDismiss}, 'Cancel'),
                        cE(rB.Button, {onClick: this.doUpdate,
                                       bsStyle: 'danger'},
                           this.state.following ? 'Follow' : 'Unfollow')
                       )
                    )
                 );
    }
};

module.exports = DisplayEdit;
