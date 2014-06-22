define(function() {
    return function(game) {
        console.log('Creating Net');

        var sprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 115, 'net');
        sprite.scale.setTo(1.0, 0.3);
        game.physics.p2.enable(sprite, false);
        sprite.body.motionState = 2; // STATIC
        // Weird bug: Players can walk through the net when motionstate = STATIC and
        // mass is not set or if mass = 1 ... why?
        sprite.body.mass = 0.1;
        sprite.body.fixedRotation = true;
    };
});