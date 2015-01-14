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
	});
});
