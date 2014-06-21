! function() {

    var player1;
    var player2;
    var ball;
    var net;


    var Player = function(playerName, startPosX, inputConfig) {
        var score = 0;
        var sprite = game.add.sprite(startPosX, game.world.height - 35, 'dude');
        game.physics.p2.enable(sprite, false);

        sprite.body.clearShapes();
        sprite.body.loadPolygon('physicsData', 'robo2');

        sprite.body.fixedRotation = true;
        sprite.body.onBeginContact.add(function(body, shapeA, shapeB, equation) {
            if (body.sprite.key === 'ball' && !ball.isActive) {
                ball.activate();
            }
        }, this);
        // sprite.scale.setTo(0.4, 0.4);

        // Allow the player to jump if they are touching the ground.
        // Code is from 'tilemap gravity' example, no idea why it works...
        function checkIfCanJump() {
            var yAxis = p2.vec2.fromValues(0, 1);
            var result = false;

            for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
                var c = game.physics.p2.world.narrowphase.contactEquations[i];

                if (c.bi === sprite.body.data || c.bj === sprite.body.data) {
                    var d = p2.vec2.dot(c.ni, yAxis); // Normal dot Y-axis
                    if (c.bi === sprite.body.data) {
                        d *= -1;
                    }
                    if (d > 0.5) {
                        result = true;
                    }
                }
            }
            return result;
        }

        function moveLeft() {
            sprite.body.moveLeft(200);
        }

        function moveRight() {
            sprite.body.moveRight(200);
        }

        function jump() {
            sprite.body.moveUp(450);
        }

        return {
            name: playerName,
            score: score,
            input: inputConfig,
            sprite: sprite,
            canJump: checkIfCanJump,
            moveLeft: moveLeft,
            moveRight: moveRight,
            jump: jump
        };
    };


    var Ball = function() {
        var isGravityActive = false;
        var startPosX = game.world.width / 4;
        var sprite = game.add.sprite(startPosX, game.world.height - (game.world.height / 4), 'ball');
        sprite.scale.setTo(1.2, 1.2);
        game.physics.p2.enable(sprite, false);
        sprite.body.setCircle(sprite.width / 2);
        sprite.body.mass = 0.3;
        sprite.body.motionState = 2; // STATIC

        function activatePhysics() {
            sprite.body.motionState = 1; // DYNAMIC
            isGravityActive = true;
        }

        return {
            sprite: sprite,
            isActive: isGravityActive,
            activate: activatePhysics
        };
    };

    var Net = function() {
        var sprite = game.add.sprite(game.world.width / 2, game.world.height / 2 + 115, 'net');
        sprite.scale.setTo(1.0, 0.3);
        game.physics.p2.enable(sprite, false);
        sprite.body.motionState = 2; // STATIC
        // Weird bug: Players can walk through the net when motionstate = STATIC and
        // mass is not set or if mass = 1 ... why?
        sprite.body.mass = 0.1;
        sprite.body.fixedRotation = true;
    };

    function preload() {
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        // game.load.image('dude', 'assets/phaser-dude.png');
        game.load.image('dude', 'assets/robo2.png');
        game.load.image('ball', 'assets/pangball.png');
        game.load.image('net', 'assets/bg.png');

        //  Load our physics data exported from PhysicsEditor
        game.load.physics('physicsData', 'assets/robo2.json');
    }

    function create() {
        game.add.sprite(0, 0, 'sky');

        // Init physics
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.defaultRestitution = 0.9;
        game.physics.p2.gravity.y = 800;

        // Define input configuration for the players
        var inputPlayer1 = {
            type: 'keyboard',
            left: Phaser.Keyboard.A,
            right: Phaser.Keyboard.D,
            jump: Phaser.Keyboard.W
        }

        var inputPlayer2 = {
            type: 'keyboard',
            left: Phaser.Keyboard.LEFT,
            right: Phaser.Keyboard.RIGHT,
            jump: Phaser.Keyboard.UP
        }

        player1 = new Player('Bobby', 32, inputPlayer1);
        player2 = new Player('Tobby', game.world.width - 32, inputPlayer2);
        ball = new Ball();
        net = new Net();

        initialiseMaterials();
    }

    function initialiseMaterials() {
        var playerMaterial = game.physics.p2.createMaterial('playerMaterial');
        var ballMaterial = game.physics.p2.createMaterial('ballMaterial', ball.sprite.body);
        var worldMaterial = game.physics.p2.createMaterial('worldMaterial');

        player1.sprite.body.setMaterial(playerMaterial);
        player2.sprite.body.setMaterial(playerMaterial);
        // game.physics.p2.setMaterial(playerMaterial, [player1.sprite.body, player2.sprite.body]);

        //  4 trues = the 4 faces of the world in left, right, top, bottom order
        game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

        var ballWorldContactMaterial = game.physics.p2.createContactMaterial(ballMaterial, worldMaterial);
        ballWorldContactMaterial.friction = 0.1; // Friction to use in the contact of these two materials.
        ballWorldContactMaterial.restitution = 0.8; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerWorldContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, worldMaterial);
        playerWorldContactMaterial.friction = 0.99; // Friction to use in the contact of these two materials.
        playerWorldContactMaterial.restitution = 0.3; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerBallContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, ballMaterial);
        playerBallContactMaterial.friction = 0.9; // Friction to use in the contact of these two materials.
        playerBallContactMaterial.restitution = 1.2; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
    }

    function render() {
        game.debug.text(player1.name + ' ' + player1.score, 64, 32);
        game.debug.text(player2.name + ' ' + player2.score, game.width - 160, 32);
    }

    function update() {
        var commands = [];

        // get commands from input
        commands = handleInput(commands, player1);
        commands = handleInput(commands, player2);

        // execute commands
        commands.forEach(function(command) {
            command();
        });
    }

    function handleInput(commandList, player) {
        if (game.input.keyboard.isDown(player.input.left)) {
            commandList.push(moveLeftCommand(player));
        }
        if (game.input.keyboard.isDown(player.input.right)) {
            commandList.push(moveRightCommand(player));
        }
        if (game.input.keyboard.isDown(player.input.jump) && player.canJump()) {
            commandList.push(jumpCommand(player));
        }
        return commandList;
    }

    function jumpCommand(player) {
        return function() {
            player.jump();
        };
    }

    function moveRightCommand(player) {
        return function() {
            player.moveRight();
        };
    }

    function moveLeftCommand(player) {
        return function() {
            player.moveLeft();
        };
    }

    var game = new Phaser.Game(800, 400, Phaser.AUTO, 'volley', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

}();