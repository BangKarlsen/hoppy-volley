'use strict';

define(function() {
    function Ball(game) {
        console.log('Creating Ball');
        this.game = game;

        // Init ball to left player
        this.sprite = game.add.sprite(game.world.width / 2, game.world.height - (game.world.height / 3), game.settings.ballSprite);
        this.sprite.scale.setTo(1.2, 1.2);

        // Init physics
        game.physics.p2.enable(this.sprite, game.settings.debug);
        this.sprite.body.setCircle(this.sprite.width / 2);
        this.sprite.body.mass = 0.5;
        this.deactivate();

        // Set up floor so we register how many times the ball has hit the floor
        var lasttouchTime = Date.now();
        this.sprite.body.onBeginContact.add(function(body) {
            if (body && body.sprite.key === 'floor') {
                var currentTime = Date.now();
                // Insert 200 ms threshold to make rapid collisions count as one
                if (lasttouchTime < currentTime - 200) {
                    this.touchedFloor++;
                    lasttouchTime = currentTime;
                }
            }
        }, this);
    }

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
        this.touchedFloor = 0;
        this.lastServer = player.name;
    };

    Ball.prototype.touchedFloor = 0;

    return Ball;
});