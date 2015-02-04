var chai      	= require('chai');
var sinon     	= require('sinon');
var sinonChai 	= require('sinon-chai');
var expect    	= chai.expect;
var AssetLoader	= require('../').AssetLoader;

chai.should();
chai.use(sinonChai);

describe('AssetLoader tests:', function() {
	describe('AssetLoader', function() {
		var assetLoader;

		before(function() {
			assetLoader = new AssetLoader();
		});

		it('should have base Url', function() {
			expect(assetLoader.baseUrl).to.be.equal('/');
		});

		it('should push files to queue', function() {
			var fileUrl = 'test.file';
			assetLoader.push(fileUrl);
			expect(assetLoader.queue.length).to.be.above(0);
			expect(assetLoader.queue[0]).to.be.equal(fileUrl);
		});

		it('should load jpg file', function(done) {
			var fileUrl = 'base/test/images/rotor.jpg';
			assetLoader.loadFile(fileUrl).then(function success(res) {
				var resource = assetLoader.getResource(fileUrl);
				expect(resource).to.be.equal(res);
				done(null);
			}, function failure(err) {
				done(new Error('err: ' + err));
			});
		});

		it('should load json file', function(done) {
			var fileUrl = 'base/test/json/map.json';
			assetLoader.loadFile(fileUrl).then(function success(res) {
				expect(res).to.be.an('object');
				expect(res).to.have.property('version');
				expect(res.version).to.be.equal(10);
				done(null);
			}, function failure(err) {
				done(new Error('err: ' + err));
			})
		});

		it('should load file set', function(done) {
			var filesUrl = ['base/test/images/rotor.jpg', 'base/test/json/map.json'];
			assetLoader.loadFileSet(filesUrl).then(function success(res) {
				console.log(res);
				done(null);
			}, function failure(err) {
				done(new Error(err));
			});
		});

		it('shouldn\'t have not loaded resources', function() {
			var resource = assetLoader.getResource('/notfound');
			expect(resource).to.be.an('undefined');
		});

	});
});
