define([
    'phaser', 'ball', 'net', 'player'
], function(Phaser, Ball, Net, Player) {
    'use strict';

    function Game() {
        console.log('Making the Game');
    }

    Game.prototype.constructor = Game;

    Game.prototype.start = function() {
        this.game = new Phaser.Game(800, 400, Phaser.AUTO, 'volley', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });
    };

    Game.prototype.preload = function() {
        // It would be better to load these in the modules where they are used (player/ball/net)
        // but that seems to break something..
        this.game.load.image('sky', 'assets/sky.png');
        this.game.load.image('ground', 'assets/platform.png');
        this.game.load.image('dude', 'assets/robo2.png');
        this.game.load.image('ball', 'assets/pangball.png');
        this.game.load.image('net', 'assets/bg.png');
        //  Load player shape data exported from PhysicsEditor
        this.game.load.physics('physicsData', 'assets/robo2.json');
    };

    Game.prototype.create = function() {
        this.game.add.sprite(0, 0, 'sky');

        // Init physics
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.defaultRestitution = 0.9;
        this.game.physics.p2.gravity.y = 800;

        this.ball = new Ball(this.game);
        this.net = new Net(this.game);

        this.player1 = new Player({
            name: 'Bobby',
            side: 'left',
            input: {
                type: 'keyboard',
                left: Phaser.Keyboard.A,
                right: Phaser.Keyboard.D,
                jump: Phaser.Keyboard.W
            }
        }, this.ball, this.game);

        this.player2 = new Player({
            name: 'Tobby',
            side: 'right',
            input: {
                type: 'keyboard',
                left: Phaser.Keyboard.LEFT,
                right: Phaser.Keyboard.RIGHT,
                jump: Phaser.Keyboard.UP
            }
        }, this.ball, this.game);

        (function initialiseMaterials(player1, player2, ball, game) {
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
            playerBallContactMaterial.restitution = 1.5; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.
        })(this.player1, this.player2, this.ball, this.game);
    };

    Game.prototype.update = function() {
        function handleInput(commandList, player, game) {
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
        }

        var commands = [];

        // get commands from input
        commands = handleInput(commands, this.player1, this.game);
        commands = handleInput(commands, this.player2, this.game);

        // execute commands
        commands.forEach(function(command) {
            command();
        });
    }



    Game.prototype.render = function() {
        this.game.debug.text(this.player1.name + ' ' + this.player1.score, 64, 32);
        this.game.debug.text(this.player2.name + ' ' + this.player2.score, this.game.width - 160, 32);
    }

    return Game;
});