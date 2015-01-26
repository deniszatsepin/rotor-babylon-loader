var _           = require('lodash');
var AssetLoader	= require('./assetLoader');

/**
 * SceneParser class
 * @param {object} param
 * @constructor
 */
function SceneParser() {
  if (SceneParser._instance === null) {
    SceneParser.prototype.init.apply(this, arguments);
    SceneParser.type = 'babylon';
    SceneParser._instance = this;
  } else {
    return SceneParser._instance;
  }
}

var proto = SceneParser.prototype;

proto.init = function(param) {
  param = param || {};
  this.sceneUrl = param.url;
  if (!this.sceneUrl) {
  	throw new Error('Scene should have an Url');
  }
  this.baseUrl = this.getBaseUrl(param.url);
  this.assetLoader = new AssetLoader();
  this.assetLoader.getFile(this.sceneUrl)
  	.then(this.parseScene.bind(this), function failure() {

  	});
};

proto.parseScene = function(scene) {
	this.scene = scene;
  var assets = this.getAssets(scene.materials);
  this.assetLoader.getFileSet(assets).then(function success() {

  }, function failure() {

  });
};

proto.parseMesh = function(mesh) {

};

proto.getBaseUrl = function(url) {
  var urlParts = url.split('/');
  urlParts.pop();
  return urlParts.join('/');
};

proto.getAssets = function(materialsInfo) {
  var assets = [];
  _.each(materialsInfo, function(material) {
    var diffuseTexture = material.diffuseTexture;
    if (diffuseTexture && diffuseTexture.name) {
      var path = this.baseUrl.split('/').push(diffuseTexture.name).join('/');
      assets.push(path);
    }
  });
  return assets;
}

//static
SceneParser._instance = null;
SceneParser.getInstance = function() {
  return SceneParser._instance;
};

module.exports = SceneParser;
