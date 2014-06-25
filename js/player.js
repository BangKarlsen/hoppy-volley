define(function() {
    function Player(config, ball, game) {
        this.name = config.name;
        this.input = config.input;
        this.game = game;

        var startPosX = 60;
        if (config.side === 'right') {
            startPosX = game.world.width - startPosX;
        }
        this.sprite = game.add.sprite(startPosX, game.world.height - 35, 'dude');
        this.sprite.anchor.setTo(0.5, 0.5);
        game.physics.p2.enable(this.sprite, false);

        this.sprite.body.clearShapes();
        this.sprite.body.loadPolygon('physicsData', 'robo2');
        this.sprite.body.fixedRotation = true;

        if (config.side === 'right') {
            this.sprite.scale.x = -1;
        }
        // sprite.scale.setTo(0.4, 0.4);

        this.sprite.body.onBeginContact.add(function(body, shapeA, shapeB, equation) {
            if (body && body.sprite.key === 'ball' && !ball.isActive) {
                ball.activate();
            }
        }, this);
    };

    Player.prototype.constructor = Player;

    Player.prototype.score = 0;

    Player.prototype.moveLeft = function() {
        this.sprite.body.moveLeft(170);
    };

    Player.prototype.moveRight = function() {
        this.sprite.body.moveRight(170);
    };

    Player.prototype.jump = function() {
        this.sprite.body.moveUp(400);
    };

    // Allow the player to jump if they are touching the ground.
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