define(function() {
    function Court(game) {
        createNet(this, game);
        createFloor(this, game);
    };

    function createNet(parent, game) {
        console.log('Creating Net');
        parent.netSprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 110, 'net');
        parent.netSprite.anchor.set(0.5, 0);
        parent.netSprite.scale.setTo(1.0, 0.3);
        game.physics.p2.enable(parent.netSprite, game.settings.debug);
        parent.netSprite.body.motionState = 2; // STATIC
        // Weird bug: Players can walk through the net when motionstate = STATIC and
        // mass is not set or if mass = 1 ... why?
        parent.netSprite.body.mass = 0.1;
        parent.netSprite.body.fixedRotation = true;
    }

    function createFloor(parent, game) {
        console.log('Creating Floor');
        parent.floorSprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 200, 'floor');
        parent.floorSprite.anchor.set(0.5, 0.5);
        parent.floorSprite.rotation = Math.PI / 2;
        parent.floorSprite.scale.setTo(1.0, 10);
        game.physics.p2.enable(parent.floorSprite, game.settings.debug);
        parent.floorSprite.body.motionState = 2; // STATIC
        // Weird bug: Players can walk through the net when motionstate = STATIC and
        // mass is not set or if mass = 1 ... why?
        parent.floorSprite.body.mass = 0.1;
        parent.floorSprite.body.fixedRotation = true;

        // Set up floor so we register how many times the ball has hit the floor
        var lasttouchTime = Date.now();
        parent.floorSprite.body.onBeginContact.add(function(body, shapeA, shapeB, equation) {
            if (body && body.sprite.key === 'ball') {
                var currentTime = Date.now();
                // Insert 200 ms threshold to make rapid collisions count just once
                if (lasttouchTime < currentTime - 200) {
                    parent.floorTouches++;
                    lasttouchTime = currentTime;
                }
            }
        }, this);
    }

    Court.prototype.constructor = Court;

    Court.prototype.floorTouches = 0; // lav function til at tælle antal gange bolden har ramt jorden

    return Court;
});