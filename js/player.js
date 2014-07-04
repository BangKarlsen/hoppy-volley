define(function() {
    function Player(config, ball, game) {
        this.name = config.name;
        this.input = config.input;
        this.game = game;
        this.numTouches = 0;

        var startPosX = 60;
        if (config.side === 'right') {
            startPosX = game.world.width - startPosX;
        }
        this.sprite = game.add.sprite(startPosX, game.world.height - 65, 'dude');
        this.sprite.anchor.setTo(0.5, 0.5);
        game.physics.p2.enable(this.sprite, game.settings.debug);

        this.sprite.body.clearShapes();
        this.sprite.body.loadPolygon('physicsData', 'robo2');
        this.sprite.body.fixedRotation = true;

        // Make player look in the right direction.
        // Note this does not flip the physics data, so the player sprite should be symmetric.
        if (config.side === 'right') {
            this.sprite.scale.x = -1;
        }

        var lasttouchTime = Date.now();
        this.sprite.body.onBeginContact.add(function(body, shapeA, shapeB, equation) {
            if (body && body.sprite.key === 'ball') {
                if (!ball.isActive) {
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
    };

    Player.prototype.constructor = Player;

    Player.prototype.score = 0;

    Player.prototype.moveLeft = function() {
        this.sprite.body.moveLeft(this.game.settings.moveForce);
    };

    Player.prototype.moveRight = function() {
        this.sprite.body.moveRight(this.game.settings.moveForce);
    };

    Player.prototype.jump = function() {
        this.sprite.body.moveUp(this.game.settings.jumpForce);
    };

    // Only allow the player to jump if he is touching the ground.
    // Code is from 'tilemap gravity' example, no idea why it works...
    Player.prototype.canJump = function() {
        var yAxis = p2.vec2.fromValues(0, 1);
        var result = false;

        for (var i = 0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++) {
            var c = this.game.physics.p2.world.narrowphase.contactEquations[i];

            if (c.bodyA === this.sprite.body.data || c.bodyB === this.sprite.body.data) {
                var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
                if (c.bodyA === this.sprite.body.data) {
                    d *= -1;
                }
                if (d > 0.5) {
                    result = true;
                }
            }
        }
        return result;
    };

    return Player;
});