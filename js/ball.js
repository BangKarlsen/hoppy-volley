'use strict';

define(function() {
    function Ball(game) {
        console.log('Creating Ball');
        this.game = game;

        // Init ball to left player
        this.sprite = game.add.sprite(game.world.width / 2, game.world.height - (game.world.height / 3), 'ball');
        this.sprite.scale.setTo(1.2, 1.2);

        // Init physics
        game.physics.p2.enable(this.sprite, game.settings.debug);
        this.sprite.body.setCircle(this.sprite.width / 2);
        this.sprite.body.mass = game.settings.ballMass;
        this.deactivate();

        // Register how many times the ball has hit the floor
        var lasttouchTime = Date.now();
        this.sprite.body.onBeginContact.add(function(body) {
            if (body && body.sprite.key === 'floor') {
                var currentTime = Date.now();
                // Insert 200 ms threshold to make rapid collisions count as one
                if (lasttouchTime < currentTime - 200) {
                    var courtCenter = game.world.width / 2;
                    if (this.sprite.body.x < courtCenter - 10) {
                        this.touchedRightFloor = 0;
                        this.touchedLeftFloor++;
                    } else if (this.sprite.body.x > courtCenter + 10) {
                        this.touchedLeftFloor = 0;
                        this.touchedRightFloor++;
                    }
                    lasttouchTime = currentTime;
                }
            }
        }, this);
    }

    Ball.prototype.constructor = Ball;


    Ball.prototype.x = function () {
        return this.sprite.body.x;
    }

    Ball.prototype.y = function () {
        return this.sprite.body.y;
    }

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
        } else {
            this.sprite.body.x = this.game.world.width - (this.game.world.width / 4);
        }
        this.deactivate();
        this.sprite.body.y = this.game.world.height - (this.game.world.height / 3);
        this.touchedLeftFloor = 0;
        this.touchedRightFloor = 0;
        this.lastServer = player.id;
    };

    Ball.prototype.touchedLeftFloor = 0;

    Ball.prototype.touchedRightFloor = 0;

    return Ball;
});
