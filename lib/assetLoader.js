var EventEmitter2 = require('eventemitter2').EventEmitter2;
var _ = require('lodash');
var Q = require('q');

var AssetLoader = function(params) {
  EventEmitter2.apply(this, arguments);
  AssetLoader.prototype.init.apply(this, arguments);
};

var proto = AssetLoader.prototype = Object.create(EventEmitter2.prototype, {
  constructor: {
    configurable: true,
    enumerable: true,
    value: AssetLoader,
    writable: true
  }
});

proto.init = function(param) {
  param 					= param || {};
  this.success 		= 0;
  this.failure		= 0;
  this.queue			= [];
  this.resources	= {};
  this.baseUrl		= param.baseUrl || '/';
};

proto.push = function(fileUrl) {
  var idx = this.queue.indexOf(fileUrl);
  if (idx < 0) {
    this.queue.push(fileUrl);
  }
};

proto.getResource = function(fileUrl) {
  if (typeof this.resources[fileUrl] !== 'undefined') {
    return this.resources[fileUrl];
  }
  return undefined;
};

proto.loadFile = function(fileUrl) {
  //TODO: if it will be on server(node), we should read file from fs.
  return this.getFileRemote(fileUrl);
};

proto.loadFileSet = function(filesUrl) {
  if (_.isArray(filesUrl)) {
    var result = Q.defer();
    var files = _.map(filesUrl, function(url) {
      return this.loadFile(url).then(function(res) {
        result.notify(res);
      });
    }.bind(this));
    Q.all(files).then(function(res) {
      result.resolve(res);
    }, function(err) {
      result.reject(err);
    })
    return result.promise;
  }
  return Q.reject();
};

proto.getFileRemote = function(fileUrl) {
  var response = Q.defer();
  var url = fileUrl[0] === '/' ? fileUrl : this.baseUrl + fileUrl;
  var ext = this.getExtension(fileUrl);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = this.getResponseType(ext);

  var handler = this.getHandler(ext).bind(this, response, fileUrl);
  xhr.onload = function(e) {
    if (xhr.status === 200) {
      handler(e);
    } else if(xhr.status === 404) {
      response.reject(404);
    }
  }.bind(this);

  xhr.onerror = function(e) {
    response.reject(e);
  };
  xhr.send();
  return response.promise;
};

proto.getExtension = function(url) {
  var re = /\.([A-Z]*$)/ig;
  var ext = url.match(re);
  if (ext && ext.length) {
    return ext[0];
  }
  return '';
};

proto.getResponseType = function(ext) {
  var type = '';
  switch(ext) {
    case '.json':
    case '.babylon':
      type = 'json';
    break;
    default:
      type = 'blob';
  };
  return type;
};

proto.getHandler = function(ext) {
  return this.handlers[ext] || this.handlers['.json'];
};

proto.handlers = {
  '.json': function(promise, fileUrl, e) {
    this.resources[fileUrl] = e.target.response;
    promise.resolve(e.target.response);
  },
  '.jpg': imageHandler,
  '.jpeg': imageHandler,
  '.png': imageHandler
};

function imageHandler(promise, fileUrl, e) {
  var response = e.target.response;
  var blob = new Blob([response], {type: response.type});
  switch(blob.type) {
    case 'image/png':
    case 'image/jpeg':
      var image = document.createElement('img');
      image.onload = function() {
        URL.revokeObjectURL(image.src);
        this.resources[fileUrl] = image;
        promise.resolve(image);
      }.bind(this);
      image.src = URL.createObjectURL(blob);
      break;
  }
};

module.exports = AssetLoader;
