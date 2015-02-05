var chai      	= require('chai');
var sinon     	= require('sinon');
var sinonChai 	= require('sinon-chai');
var expect    	= chai.expect;
var AssetLoader	= require('../').AssetLoader;
var SceneParser = require('../').SceneParser;

chai.should();
chai.use(sinonChai);

describe('Scene parser tests:', function() {
	describe('SceneParser', function() {
		var assetLoader;
		var sceneParser;
		var carScene = 'base/test/scene/car/Car_LowPoly_Blue.babylon';

		before(function() {
			assetLoader = new AssetLoader();
			sceneParser = new SceneParser({
				url: carScene
			})
		});

		it('should have scene Url', function() {
			expect(sceneParser.sceneUrl).to.be.equal(carScene);
		});

		it('should have base Url', function() {
			var baseUrl = 'base/test/scene/car';
			expect(sceneParser.baseUrl).to.be.equal(baseUrl);
		});

		it('should parse scene', function(done) {
			assetLoader.loadFile(carScene).then(function(scene) {
				expect(scene).to.have.property('materials');
				var assets = sceneParser.getAssets(scene.materials);
				done();
			}, function(err) {
				done(err);
			})
		});
	});
});
