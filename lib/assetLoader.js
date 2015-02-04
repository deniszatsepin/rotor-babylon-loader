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

proto.getFile = function(fileUrl, onload, onerror) {
	return this.getFileRemote(fileUrl, onload, onerror);
};


proto.getFileRemote = function(fileUrl) {
	var response = Q.defer();
	var url = fileUrl[0] === '/' ? fileUrl : this.baseUrl + fileUrl;
	var ext = this.getExtension(fileUrl);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = this.getResponseType(ext);
	xhr.onload = this.getHandler(ext).bind(this, response);
	xhr.onerror = function(e) {
		response.reject(e);
	};
	xhr.send();
	return response.promise;
};

proto.getExtension = function(url) {
	var re = /\.([A-Z]*$)/ig;
	return url.match(re)[0];
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
	'.json': function(promise, e) {
		promise.resolve(e.target.response);
	},
	'.jpg': imageHandler,
	'.jpeg': imageHandler,
	'.png': imageHandler
};

function imageHandler(promise, e) {
	var response = e.target.response;
	var blob = new Blob([response], {type: response.type});
	switch(blob.type) {
		case 'image/png':
		case 'image/jpeg':
			var image = document.createElement('img');
			image.onload = function() {
				URL.revokeObjectURL(img.src);
				promise.resolve(image);
			};
			image.src = URL.createObjectURL(blob);
			break;
	}
};

proto.start = function() {
	this.queue.forEach(function(fileUrl, index){
	}.bind(this));
};

proto.onerror = function(response, e) {
	response.reject(e);
};

proto.onload = function(fileUrl, e) {
	var xhr = e.target;
	if (xhr.status === 200) {
		switch(xhr.responseType) {
			case 'json':
				this.resources[fileUrl] = xhr.response;
				this.success += 1;
				this.emit(fileUrl);
				break;
			default:
				var blob = new Blob([xhr.response], {type: xhr.response.type});
				this.convertFile(fileUrl, blob);
		};
	} else if (xhr.status === 404) {
		this.failure += 1;
	}
	this.ifLoaded();
};

proto.ifLoaded = function() {
	if (this.success + this.failure === this.queue.length) {
		this.emit('loaded');
	}
};

proto.convertFile = function(fileUrl, blob) {
	var resource = {
		data: blob
	};
	switch(blob.type) {
		case 'image/png':
		case 'image/jpeg':
			resource.image = document.createElement('img');
			resource.image.onload = function() {
				URL.revokeObjectURL(img.src);
				done.bind(this);
			};
			resource.image.src = URL.createObjectURL(blob);
			this.resources[fileUrl] = resource;
			break;
	}

	function done() {
		this.success += 1;
		this.emit(fileUrl);
		this.ifLoaded();
	}
};

module.exports = AssetLoader;