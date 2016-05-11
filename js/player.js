'use strict';

define(function() {
    function Player(config, ball, game) {
        this.id = config.id;
        this.name = config.name;
        this.input = config.input;
        this.side = config.side;
        this.game = game;
        this.numTouches = 0;
        this.score = 0;
        this.sprite = game.add.sprite(this.getStartPositionX(), this.getStartPositionY(), 'dude');
        this.sprite.anchor.setTo(0.5, 0.5);
        game.physics.p2.enable(this.sprite, game.settings.debug);

        this.sprite.body.clearShapes();
        this.sprite.body.loadPolygon('physicsData', 'hoppy');

        // Make player look in the right direction.
        // This does not flip the physics data, but the player sprite is symmetric for now.
        if (config.side === 'right') {
            this.sprite.scale.x = -1;
        }

        // Register when player touches the ball
        var lasttouchTime = Date.now();
        this.sprite.body.onBeginContact.add(function(body) {
            if (body && body.sprite.key === 'ball') {
                if (!ball.isActive) {   // player serves the ball
                    ball.activate();
                    this.numTouches++;
                } else {
                    var currentTime = Date.now();
                    // Insert 200 ms threshold to make rapid collisions count just once
                    if (lasttouchTime < currentTime - 200) {
                        this.numTouches++;
                        lasttouchTime = currentTime;
                    }
                }
            }
        }, this);
    }

    Player.prototype.constructor = Player;

    Player.prototype.x = function () {
        return this.sprite.body.x;  
    }

    Player.prototype.y = function () {
        return this.sprite.body.y;  
    }

    Player.prototype.getStartPositionX = function() {
        var startPosX = this.game.settings.playerStartPosition;
        if (this.side === 'right') {
            startPosX = this.game.world.width - startPosX;
        }
        return startPosX;
    }

    Player.prototype.getStartPositionY = function() {
        return this.game.world.height - 75;
    }

    Player.prototype.moveToStart = function() {
        this.sprite.body.x = this.getStartPositionX();
        this.sprite.body.y = this.getStartPositionY();
        this.sprite.body.rotation = 0;
        this.sprite.body.setZeroForce();
        this.sprite.body.setZeroRotation();
        this.sprite.body.setZeroVelocity();
    }

    Player.prototype.moveLeft = function() {
        this.sprite.body.moveLeft(this.game.settings.moveForce);
    };

    Player.prototype.moveRight = function() {
        this.sprite.body.moveRight(this.game.settings.moveForce);
    };

    Player.prototype.jump = function() {
        // Only allow the player to jump if he is touching the ground.
        // Code is from 'tilemap gravity' example, no idea why it works...
        function canJump(Player) {
            var yAxis = p2.vec2.fromValues(0, 1);
            var result = false;

            for (var i = 0; i < Player.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
                var c = Player.game.physics.p2.world.narrowphase.contactEquations[i];

                if (c.bodyA === Player.sprite.body.data || c.bodyB === Player.sprite.body.data) {
                    var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
                    if (c.bodyA === Player.sprite.body.data) {
                        d *= -1;
                    }
                    if (d > 0.5) {
                        result = true;
                    }
                }
            }
            return result;
        };

        if (canJump(this)) {
            this.sprite.body.moveUp(this.game.settings.jumpForce);
        }
    };
    
    Player.prototype.incrementScore = function() {
        this.score++;
        this.displayScore.text = this.score + '';
    }

    return Player;
});
