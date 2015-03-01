'use strict';

define(function() {
    function Court(game) {
        createNet(this, game);
        createFloor(this, game);
    }

    function createNet(parent, game) {
        console.log('Creating Net');
        parent.netSprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 110, 'net');
        parent.netSprite.anchor.set(0.5, 0);
        parent.netSprite.scale.setTo(1.0, 0.3);
        game.physics.p2.enable(parent.netSprite, game.settings.debug);        
        parent.netSprite.body.static = true;
    }

    function createFloor(parent, game) {
        console.log('Creating Floor');
        parent.floorSprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 200, 'floor');
        parent.floorSprite.anchor.set(0.5, 0.5);
        parent.floorSprite.scale.setTo(1.0, 10);
        game.physics.p2.enable(parent.floorSprite, game.settings.debug);
        parent.floorSprite.body.static = true;
        parent.floorSprite.body.rotation = Math.PI / 2;
    }

    Court.prototype.constructor = Court;

    return Court;
});