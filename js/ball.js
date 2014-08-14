define(function() {
    function Ball(game, spriteName) {
        console.log('Creating Ball');
        // Hack to get e reference to game in serve()
        this.game = game;

        // Init ball to left player
        this.sprite = game.add.sprite(game.world.width / 2, game.world.height - (game.world.height / 3), 'ball');
        this.sprite.scale.setTo(1.2, 1.2);

        // Init physics
        game.physics.p2.enable(this.sprite, game.settings.debug);
        this.sprite.body.setCircle(this.sprite.width / 2);
        this.sprite.body.mass = 0.5;
        this.deactivate();
    };

    Ball.prototype.constructor = Ball;

    Ball.prototype.isActive = false;

    Ball.prototype.activate = function() {
        this.sprite.body.motionState = 1; // DYNAMIC
        this.isActive = true;
    };

    Ball.prototype.deactivate = function() {
        this.sprite.body.motionState = 2; // STATIC
        this.isActive = false;
    };

    Ball.prototype.serve = function(player) {
        if (player.side === 'left') {
            this.sprite.body.x = this.game.world.width / 4;
            this.deactivate();
        } else {
            this.sprite.body.x = this.game.world.width - (this.game.world.width / 4);
            this.deactivate();
        }
        this.sprite.body.y = this.game.world.height - (this.game.world.height / 3);
    };

    return Ball;
});