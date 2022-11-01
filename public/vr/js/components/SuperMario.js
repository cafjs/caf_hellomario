
'use strict';
const React = require('react');
const aframe = require('aframe');

const {Entity, Scene} = require('aframe-react');
const cE = React.createElement;

class SuperMario extends React.Component {

    constructor(props) {
        super(props);
        this.marioRef = React.createRef();
    }

    componentDidUpdate() {
        if (this.marioRef.current) {
            this.marioRef.current.el.components['animation'].el.emit('flip',
                                                                     {});
        }
    }

    render() {
        return cE(Entity, {
            'gltf-model': '{{__CDN__}}/assets/supermario.gltf',//'#supermario',
            ref: this.marioRef,
            position: {x: 0.5, y: 0.6, z: -2.8},
            rotation: {x: 0, y: 90.0, z: 0},
            animation: 'property: rotation; to: 359 90 0; dur: 2000; easing: linear; startEvents: flip',
            scale: '0.5 0.5 0.5'
        });
    }
}

module.exports = SuperMario;
