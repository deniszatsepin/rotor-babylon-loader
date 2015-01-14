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
		var url = fileUrl[0] === '/' ? fileUrl : this.baseUrl + fileUrl;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';
		xhr.onload = this.onload.bind(this, fileUrl, xhr);
		xhr.onerror = this.onerror.bind(this, fileUrl, xhr);
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
		var blob = new Blob([xhr.response], {type: xhr.response.type});
		this.success += 1;
		this.resources[fileUrl] = blob;
	} else if (xhr.status === 404) {
		this.failure += 1;
	}
};

module.exports = AssetLoader;