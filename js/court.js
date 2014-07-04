define(function() {
    function Court(game) {
        console.log('Creating Net');
        this.netSprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 110, 'net');
        this.netSprite.anchor.set(0.5, 0);
        this.netSprite.scale.setTo(1.0, 0.3);
        game.physics.p2.enable(this.netSprite, game.settings.debug);
        this.netSprite.body.motionState = 2; // STATIC
        // Weird bug: Players can walk through the net when motionstate = STATIC and
        // mass is not set or if mass = 1 ... why?
        this.netSprite.body.mass = 0.1;
        this.netSprite.body.fixedRotation = true;

        console.log('Creating Floor');
        this.floorSprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 200, 'floor');
        this.floorSprite.anchor.set(0.5, 0.5);
        this.floorSprite.rotation = Math.PI / 2;
        this.floorSprite.scale.setTo(1.0, 10);
        game.physics.p2.enable(this.floorSprite, game.settings.debug);
        this.floorSprite.body.motionState = 2; // STATIC
        // Weird bug: Players can walk through the net when motionstate = STATIC and
        // mass is not set or if mass = 1 ... why?
        this.floorSprite.body.mass = 0.1;
        this.floorSprite.body.fixedRotation = true;
    };

    Court.prototype.constructor = Court;

    Court.prototype.numTouches = 0; // lav function til at tælle antal gange bolden har ramt jorden

    return Court;
});