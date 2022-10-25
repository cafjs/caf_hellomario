'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const AppActions = require('../actions/AppActions');
const AppStatus = require('./AppStatus');

const DisplayError = require('./DisplayError');
const DisplayEdit = require('./DisplayEdit');
const DisplayDisconnect = require('./DisplayDisconnect');

const MarioEvents = require('./MarioEvents');
const Manage = require('./Manage');
const Follow = require('./Follow');
const Daemon = require('./Daemon');

const cE = React.createElement;

class MyApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.ctx.store.getState();
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    _onChange() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    }

    render() {
        return cE('div', {className: 'container-fluid'},
                  cE(DisplayError, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(DisplayEdit, {
                      ctx: this.props.ctx,
                      displayEdit: this.state.displayEdit,
                      linkedTo: this.state.linkedTo
                  }),
                  cE(DisplayDisconnect, {
                      ctx: this.props.ctx,
                      displayDisconnect: this.state.displayDisconnect
                  }),
                  cE(rB.Panel, null,
                     cE(rB.Panel.Heading, null,
                        cE(rB.Panel.Title, null,
                           cE(rB.Grid, {fluid: true},
                              cE(rB.Row, null,
                                 cE(rB.Col, {sm:1, xs:1},
                                    cE(AppStatus, {
                                        isClosed: this.state.isClosed
                                    })
                                   ),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:10,
                                     className: 'text-right'
                                 }, 'hellomario'),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:11,
                                     className: 'text-right'
                                 }, this.state.fullName)
                                )
                             )
                          )
                       ),
                     cE(rB.Panel.Body, null,
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Manage')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(Follow, {
                                  ctx: this.props.ctx,
                                  linkedTo: this.state.linkedTo
                              }),
                              cE(Manage, {
                                  ctx: this.props.ctx,
                                  inIFrame: this.state.inIFrame,
                                  isConnected: this.state.isConnected
                              }),
                              cE(Daemon, {
                                  ctx: this.props.ctx,
                                  inIFrame: this.state.inIFrame
                              }),
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Super Mario: ' +
                                 (this.state.isConnected ?
                                  'Connected' :
                                  'NOT Connected')
                                )
                             ),
                           cE(rB.Panel.Body, null,
                              cE(MarioEvents, {
                                  ctx: this.props.ctx,
                                  marioEvents: this.state.marioEvents
                              })
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = MyApp;
