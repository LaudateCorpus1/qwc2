/**
 * Copyright 2016, Sourcepole AG.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const Message = require('../components/I18N/Message');
const MapUtils = require('../utils/MapUtils');
const {setActiveLayerInfo} = require('../actions/layerinfo');
const ResizeableWindow = require("../components/ResizeableWindow");
const LayerUtils = require('../utils/LayerUtils');
const MiscUtils = require('../utils/MiscUtils');
require('./style/LayerInfoWindow.css');

class LayerInfoWindow extends React.Component {
    static propTypes = {
        bboxDependentLegend: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        layer: PropTypes.object,
        map: PropTypes.object,
        scaleDependentLegend: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        sublayer: PropTypes.object,
        setActiveLayerInfo: PropTypes.func,
        windowSize: PropTypes.object,
        bboxDependentLegend: PropTypes.bool
    }
    renderLink(text, url) {
        return url ? (<a href={url} target="_blank">{text}</a>) : text ? text : null;
    }
    renderRow = (title, content, html=false) => {
        if(content) {
            return (
                <tr>
                    <td><Message msgId={title} />:</td>
                    {html ? (
                        <td dangerouslySetInnerHTML={{__html: MiscUtils.addLinkAnchors(content)}}></td>
                    ) : (<td>{content}</td>)}
                </tr>
            );
        }
        return null;
    }
    renderMetadata = (metadata) => {
        return metadata.map(entry => this.renderRow(entry.label, entry.content, true));
    }
    render() {
        if(!this.props.layer || !this.props.sublayer) {
            return null;
        }
        let legend = null;
        const scale = MapUtils.computeForZoom(this.props.map.scales, this.props.map.zoom);
        const legendUrl = LayerUtils.getLegendUrl(this.props.layer, this.props.sublayer, scale, this.props.map, this.props.bboxDependentLegend, this.props.scaleDependentLegend);
        if (legendUrl) {
            legend = (<img className="layer-info-window-legend" src={legendUrl} />);
        } else if (this.props.layer.color) {
            legend = (<span className="layer-info-window-coloricon" style={{backgroundColor: this.props.layer.color}} />);
        }
        return (
            <ResizeableWindow title="layerinfo.title" icon="info-sign" onClose={this.onClose} zIndex={9}
                initialWidth={this.props.windowSize.width} initialHeight={this.props.windowSize.height}>
                <div role="body" className="layer-info-window-body">
                    <h4 className="layer-info-window-title">{this.props.sublayer.title}</h4>
                    <div className="layer-info-window-frame">
                        <table className="layer-info-window-table">
                            <tbody>
                            {this.renderRow("layerinfo.abstract", this.props.sublayer.abstract, true)}
                            {this.props.sublayer.attribution ? this.renderRow("layerinfo.attribution", this.renderLink(this.props.sublayer.attribution.Title, this.props.sublayer.attribution.OnlineResource)) : null}
                            {this.renderRow("layerinfo.keywords", this.props.sublayer.keywords)}
                            {this.renderRow("layerinfo.dataUrl", this.renderLink(this.props.sublayer.dataUrl, this.props.sublayer.dataUrl))}
                            {this.renderRow("layerinfo.metadataUrl", this.renderLink(this.props.sublayer.metadataUrl, this.props.sublayer.metadataUrl))}
                            {this.props.sublayer.minScale !== undefined ? this.renderRow("layerinfo.maxscale", this.renderScale(this.props.sublayer.minScale)) : null}
                            {this.props.sublayer.maxScale !== undefined ? this.renderRow("layerinfo.minscale", this.renderScale(this.props.sublayer.maxScale)) : null}
                            {this.renderRow("layerinfo.legend", legend)}
                            {this.props.sublayer.metadata !== undefined ? this.renderMetadata(this.props.sublayer.metadata) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ResizeableWindow>
        );
    }
    renderScale = (scale) => {
        if(scale === 0) {
            return "0";
        } else if(scale >= 1) {
            return "1:" + Math.round(scale);
        } else {
            return Math.round(1./scale) + ":1";
        }
    }
    onClose = () => {
        this.props.setActiveLayerInfo(null, null);
    }
};

const selector = state => ({
    map: state.map,
    layer: state.layerinfo.layer || null,
    sublayer: state.layerinfo.sublayer || null
});

module.exports = connect(selector, {
    setActiveLayerInfo: setActiveLayerInfo
})(LayerInfoWindow);
