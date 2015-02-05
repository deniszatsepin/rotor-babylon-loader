var _           = require('lodash');
var Q           = require('q');
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
};

proto.start = function() {
  var result = Q.defer();
  this.assetLoader.loadFile(this.sceneUrl)
    .then(function success(scene) {
      this.parseScene(scene).then(function(res) {
        result.resolve(res);
      }, function(err) {
        result.reject(err);
      });
    }.bind(this), function failure(err) {
      result.reject(err);
    });
  return result.promise;
};

proto.parseScene = function(scene) {
  var result = Q.defer();
  this.scene = scene;
  var assets = this.getAssets(scene.materials);
  this
    .assetLoader
    .loadFileSet(assets)
    .then(function success(res) {
      doParse(scene);
      result.resolve();
    }.bind(this), function failure(err) {
      result.reject(err);
    });
  return result.promise;
};

proto.doParse = function(scene) {
  //At that moment all media files has been loaded

}

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
      var path = this.baseUrl.split('/');
      path.push(diffuseTexture.name);
      path = path.join('/');
      assets.push(path);
    }
  }.bind(this));
  return _.uniq(assets);
};

//static
SceneParser._instance = null;
SceneParser.getInstance = function() {
  return SceneParser._instance;
};

module.exports = SceneParser;
