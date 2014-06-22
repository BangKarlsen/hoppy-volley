define(function() {
    function Ball(game) {
        console.log('Creating Ball');
        // set startPosX from constructor argument when real game
        var startPosX = game.world.width / 4;
        this.sprite = game.add.sprite(startPosX, game.world.height - (game.world.height / 4), 'ball');
        this.sprite.scale.setTo(1.2, 1.2);
        game.physics.p2.enable(this.sprite, false);

        this.sprite.body.setCircle(this.sprite.width / 2);
        this.sprite.body.mass = 0.3;
        this.sprite.body.motionState = 2; // STATIC
    };

    Ball.prototype.constructor = Ball;

    Ball.prototype.isActive = false;

    Ball.prototype.activate = function() {
        this.sprite.body.motionState = 1; // DYNAMIC
        this.isActive = true;
    };

    return Ball;
});