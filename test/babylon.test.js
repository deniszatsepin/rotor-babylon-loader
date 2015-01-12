var chai      = require('chai');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
var Game      = require('../lib/game');

chai.should();
chai.use(sinonChai);

describe('Game tests:', function() {
  describe('Game', function() {
    var game;

    before(function() {
      game = new Game();
    });

    it('should have root entity', function() {
      expect(game._entities.name).to.be.equal('Root');
    });
  });
});
