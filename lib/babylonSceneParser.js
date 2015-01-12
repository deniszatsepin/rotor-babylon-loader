var _               = require('lodash');

/**
 * SceneParser class
 * @param {object} param
 * @constructor
 */
function SceneParser() {
  if (SceneParser._instance === null) {
    SceneParser.prototype.init.apply(this, arguments);
    SceneParser._instance = this;
  } else {
    return SceneParser._instance;
  }
}

var proto = SceneParser.prototype;

proto.init = function(param) {
  param = param || {};

};

proto.parseScene = function(scene) {

};

proto.parseMesh = function(mesh) {

};

//static
SceneParser._instance = null;
SceneParser.getInstance = function() {
  return SceneParser._instance;
};

module.exports = SceneParser;
