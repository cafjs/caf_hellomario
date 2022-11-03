
'use strict';
const React = require('react');
const aframe = require('aframe');

const {Entity, Scene} = require('aframe-react');
const cE = React.createElement;

class SuperMario extends React.Component {

    constructor(props) {
        super(props);
        this.marioRef = React.createRef();
        this.lastEvent = Date.now();
    }

    componentDidUpdate() {
        if (this.marioRef.current) {
            //type Array<{timestamp, source, topic, obj}>
            for (const ev of this.props.marioEvents) {
                if ((ev.timestamp > this.lastEvent) &&
                    (typeof ev.obj.gesture === 'number') &&
                    (!this.props.linkedTo ||
                     (this.props.linkedTo === (ev.source + '-marioEvents')))
                   ) {
                    this.lastEvent = ev.timestamp;
                    this.marioRef.current.el.components['animation']
                        .el.emit('flip', {});
                }
            }
        }
    }

    render() {
        const model = this.props.linkedTo ?
            this.props.linkedHubType :
            this.props.myHubType;
        const modelRef = model === 'mario' ?
            '{{__CDN__}}/assets/supermario.gltf' :
            '{{__CDN__}}/assets/luigi.gltf';

        return cE(Entity, {
            'gltf-model': modelRef,
            ref: this.marioRef,
            position: {x: 0.3, y: 0.6, z: -2.0},
            rotation: {x: 0, y: 90.0, z: 0},
            animation: 'property: rotation; to: 359 90 0; dur: 1000; easing: linear; startEvents: flip',
            scale: '0.3 0.3 0.3'
        });
    }
}

module.exports = SuperMario;
