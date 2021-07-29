import React, {Fragment} from 'react'
import PropTypes from 'prop-types'

import { camelize } from '../lib/String'

const evtNames = [
  'click',
  'dblclick',
  'dragend',
  'mousedown',
  'mouseout',
  'mouseover',
  'mouseup',
  'recenter',
];

const wrappedPromise = function() {
    var wrappedPromise = {},
        promise = new Promise(function (resolve, reject) {
            wrappedPromise.resolve = resolve;
            wrappedPromise.reject = reject;
        });
    wrappedPromise.then = promise.then.bind(promise);
    wrappedPromise.catch = promise.catch.bind(promise);
    wrappedPromise.promise = promise;

    return wrappedPromise;
}

export class Marker extends React.Component {

  componentDidMount() {
    this.markerPromise = wrappedPromise();
    this.renderMarker();
  }

    componentDidUpdate(prevProps) {
        if ((this.props.map !== prevProps.map) ||
            (this.props.position !== prevProps.position) ||
            (this.props.icon !== prevProps.icon) ||
            (this.props.animation !== prevProps.animation)) {
            if (this.marker) {
                this.marker.setMap(null);
            }
            this.renderMarker();
        }
    }

  componentWillUnmount() {
    if (this.marker) {
      this.marker.setMap(null);
    }
  }

  renderMarker() {
    const {
      map,
      google,
      position,
      mapCenter,
      icon,
      label,
      draggable,
      title,
      animation,
      zIndex,
      ...props
    } = this.props;
    if (!google) {
      return null
    }

    let pos = position || mapCenter;
    if (!(pos instanceof google.maps.LatLng)) {
      pos = new google.maps.LatLng(pos.lat, pos.lng);
    }

    const pref = {
      map,
      position: pos,
      icon,
      label,
      title,
      draggable,
      animation: animation,
      zIndex: zIndex,
      ...props
    };
    this.marker = new google.maps.Marker(pref);

    evtNames.forEach(e => {
      this.marker.addListener(e, this.handleEvent(e));
    });

    this.markerPromise.resolve(this.marker);
  }

  getMarker() {
    return this.markerPromise;
  }

  handleEvent(evt) {
    return (e) => {
      const evtName = `on${camelize(evt)}`
      if (this.props[evtName]) {
        this.props[evtName](this.props, this.marker, e);
      }
    }
  }

  render() {
    return null;
  }
}

Marker.propTypes = {
    position: PropTypes.object,
    map: PropTypes.object,
    animation: PropTypes.number,
    zIndex: PropTypes.number
};

evtNames.forEach(e => Marker.propTypes[e] = PropTypes.func)

Marker.defaultProps = {
    name: 'Marker',
    animation: 0
};

export default Marker
