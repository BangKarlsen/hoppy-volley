(function() {

    var player;
    var platforms;
    var cursors;
    var ball;
    var debugBallCollision;

    var Player = function() {

    }

    var game = new Phaser.Game(800, 400, Phaser.AUTO, 'volley', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

    function preload() {
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('dude', 'assets/phaser-dude.png');
        game.load.image('ball', 'assets/pangball.png');
    }

    function create() {
        //  A simple background for our game
        game.add.sprite(0, 0, 'sky');
        // The player and the ball
        player = game.add.sprite(32, game.world.height - 35, 'dude');
        ball = game.add.sprite(35, game.world.height / 2, 'ball');

        //  We're going to be using physics, so enable the Physics system
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.defaultRestitution = 0.9;
        game.physics.p2.gravity.y = 800;

        //  We need to enable physics on all sprites
        game.physics.p2.enable([player, ball], false);
        ball.body.setCircle(ball.width / 2);
        ball.body.mass = 0.3;
        ball.body.gravity.setMagnitude(0);

        player.body.fixedRotation = true;
        player.body.onBeginContact.add(playerHit, this);

        var playerMaterial = game.physics.p2.createMaterial('playerMaterial', player.body);
        var ballMaterial = game.physics.p2.createMaterial('ballMaterial', ball.body);
        var worldMaterial = game.physics.p2.createMaterial('worldMaterial');

        //  4 trues = the 4 faces of the world in left, right, top, bottom order
        game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

        var ballWorldContactMaterial = game.physics.p2.createContactMaterial(ballMaterial, worldMaterial);
        ballWorldContactMaterial.friction = 0.1; // Friction to use in the contact of these two materials.
        ballWorldContactMaterial.restitution = 0.8; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerWorldContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, worldMaterial);
        playerWorldContactMaterial.friction = 0.9; // Friction to use in the contact of these two materials.
        playerWorldContactMaterial.restitution = 0.3; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerBallContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, ballMaterial);
        playerBallContactMaterial.friction = 0.9; // Friction to use in the contact of these two materials.
        playerBallContactMaterial.restitution = 1.2; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        cursors = game.input.keyboard.createCursorKeys();
    }

    function playerHit(body, shapeA, shapeB, equation) {
        debugBallCollision = 'You last hit: ' + body.sprite.key;
    }

    function update() {
        player.body.setZeroForce();

        if (cursors.left.isDown) {
            player.body.moveLeft(250);
        } else if (cursors.right.isDown) {
            player.body.moveRight(250);
        }
        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && checkIfCanJump()) {
            player.body.moveUp(500);
        }
    }

    function checkIfCanJump() {
        var yAxis = p2.vec2.fromValues(0, 1);
        var result = false;

        for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
            var c = game.physics.p2.world.narrowphase.contactEquations[i];

            if (c.bi === player.body.data || c.bj === player.body.data) {
                var d = p2.vec2.dot(c.ni, yAxis); // Normal dot Y-axis
                if (c.bi === player.body.data) {
                    d *= -1;
                }
                if (d > 0.5) result = true;
            }
        }
        return result;
    }

    function render() {
        game.debug.text(debugBallCollision, 32, 32);
        game.debug.text('Ball mass:' + ball.body.mass, 32, 32 * 2);
    }

}());