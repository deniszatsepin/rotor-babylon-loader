var EventEmitter2 = require('eventemitter2').EventEmitter2;
var _ = require('lodash');


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
	param = param || {};
	this.success = 0;
	this.failure = 0;
	this.queue = [];
	this.resources = {};
	this.baseUrl = param.baseUrl || '/';
};

proto.push = function(fileUrl) {
	var idx = this.queue.indexOf(fileUrl);
	if (idx < 0) {
		this.queue.push(fileUrl);
	}
};

proto.start = function() {
	this.queue.forEach(function(fileUrl, index){
		var re = /\.([A-Z]*$)/ig;
		var ext = fileUrl.match(re)[0];

		var url = fileUrl[0] === '/' ? fileUrl : this.baseUrl + fileUrl;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		switch(ext) {
			case '.json':
			case '.babylon':
				xhr.responseType = 'json';
				break;
			default:
				xhr.responseType = 'blob';
		};
		xhr.onload = this.onload.bind(this, fileUrl);
		xhr.onerror = this.onerror.bind(this, fileUrl);
		xhr.send();
	}.bind(this));
};

proto.onerror = function(fileUrl, e) {
	var xhr = e.target;
	this.failure += 1;
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