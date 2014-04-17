(function() {

    var player1;
    var platforms;
    var cursors;
    var ball;
    var debugBallCollision;

    var Player = function(playerName, startPosX) {
        var name = playerName;
        var sprite = game.add.sprite(startPosX, game.world.height - 35, 'dude');
        game.physics.p2.enable(sprite, false);
        sprite.body.fixedRotation = true;
        sprite.body.onBeginContact.add(playerHit, this);

        function checkIfCanJump() {
            var yAxis = p2.vec2.fromValues(0, 1);
            var result = false;

            for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
                var c = game.physics.p2.world.narrowphase.contactEquations[i];

                if (c.bi === player1.sprite.body.data || c.bj === player1.sprite.body.data) {
                    var d = p2.vec2.dot(c.ni, yAxis); // Normal dot Y-axis
                    if (c.bi === player1.sprite.body.data) {
                        d *= -1;
                    }
                    if (d > 0.5) result = true;
                }
            }
            return result;
        }

        return {
            name: name,
            sprite: sprite,
            canJump: checkIfCanJump
        };
    }


    var Ball = function() {
        var sprite = game.add.sprite(35, game.world.height / 2, 'ball');
        game.physics.p2.enable(sprite, false);
        sprite.body.setCircle(sprite.width / 2);
        sprite.body.mass = 0.3;
        sprite.body.gravity.setMagnitude(0);

        return {
            sprite: sprite
        };
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

        //  We're going to be using physics, so enable the Physics system
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.defaultRestitution = 0.9;
        game.physics.p2.gravity.y = 800;

        // Create the ball and the players
        player1 = new Player('Bobby', 32);
        ball = new Ball();

        initAllMaterials();

        cursors = game.input.keyboard.createCursorKeys();
    }

    function initAllMaterials() {
        var playerMaterial = game.physics.p2.createMaterial('playerMaterial', player1.sprite.body);
        var ballMaterial = game.physics.p2.createMaterial('ballMaterial', ball.sprite.body);
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

    }

    function playerHit(body, shapeA, shapeB, equation) {
        debugBallCollision = 'You last hit: ' + body.sprite.key;
    }

    function update() {
        player1.sprite.body.setZeroForce();

        if (cursors.left.isDown) {
            player1.sprite.body.moveLeft(250);
        } else if (cursors.right.isDown) {
            player1.sprite.body.moveRight(250);
        }
        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player1.canJump()) {
            player1.sprite.body.moveUp(500);
        }
    }


    function render() {
        game.debug.text(debugBallCollision, 32, 32);
        game.debug.text('Player1: ' + player1.name, 32, 32 * 2);
    }

}());