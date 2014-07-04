define([
    'phaser', 'ball', 'court', 'player'
], function(Phaser, Ball, Court, Player) {
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

        this.game.settings = {
            debug: false,
            jumpForce: 450,
            moveForce: 200
        };
    };

    Game.prototype.preload = function() {
        // It would be better to load these in the modules where they are used (player/ball/net)
        // but that seems to break something..
        this.game.load.image('sky', 'assets/sky.png');
        this.game.load.image('ground', 'assets/platform.png');
        this.game.load.image('dude', 'assets/robo2.png');
        this.game.load.image('ball', 'assets/pangball.png');
        this.game.load.image('net', 'assets/bg.png');
        this.game.load.image('floor', 'assets/bg.png');

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
        this.court = new Court(this.game);

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

        initMaterials(this.player1, this.player2, this.ball, this.court, this.game);
        initScoreText(this);
    };

    function initMaterials(player1, player2, ball, court, game) {
        var playerMaterial = game.physics.p2.createMaterial('playerMaterial');
        var ballMaterial = game.physics.p2.createMaterial('ballMaterial', ball.sprite.body);
        var worldMaterial = game.physics.p2.createMaterial('worldMaterial');
        var courtMaterial = game.physics.p2.createMaterial('courtMaterial', court.floorSprite.body);

        player1.sprite.body.setMaterial(playerMaterial);
        player2.sprite.body.setMaterial(playerMaterial);

        //  4 trues = the 4 faces of the world in left, right, top, bottom order
        game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

        var ballWorldContactMaterial = game.physics.p2.createContactMaterial(ballMaterial, worldMaterial);
        ballWorldContactMaterial.friction = 0.1; // Friction to use in the contact of these two materials.
        ballWorldContactMaterial.restitution = 0.9; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerWorldContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, worldMaterial);
        playerWorldContactMaterial.friction = 0.5; // Friction to use in the contact of these two materials.
        playerWorldContactMaterial.restitution = 0.3; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerBallContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, ballMaterial);
        playerBallContactMaterial.friction = 0.9; // Friction to use in the contact of these two materials.
        playerBallContactMaterial.restitution = 1.3; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerCourtContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, courtMaterial);
        playerCourtContactMaterial.friction = 0.5;
        playerCourtContactMaterial.restitution = 0.3;
    };

    function initScoreText(that) {
        var style = {
            font: '20px Arial',
            fill: '#ffffff',
            align: "left"
        };
        that.textNamePlayer1 = that.game.add.text(70, 32, that.player1.name, style);
        that.textScorePlayer1 = that.game.add.text(45, 32, that.player1.score, style);
        style.align = 'right';
        that.textNamePlayer2 = that.game.add.text(that.game.width - 110, 32, that.player2.name, style);
        that.textScorePlayer2 = that.game.add.text(that.game.width - 45, 32, that.player2.score, style);
    };

    Game.prototype.update = function() {
        this.textScorePlayer1.text = '' + this.player1.numTouches;
        this.textScorePlayer2.text = '' + this.player2.numTouches;

        var commands = [];

        // get commands from input
        commands = handleInput(commands, this.player1, this.game);
        commands = handleInput(commands, this.player2, this.game);

        // execute commands
        commands.forEach(function(command) {
            command();
        });
    }

    function handleInput(commands, player, game) {
        if (game.input.keyboard.isDown(player.input.left)) {
            commands.push(moveLeftCommand(player));
        }
        if (game.input.keyboard.isDown(player.input.right)) {
            commands.push(moveRightCommand(player));
        }
        if (game.input.keyboard.isDown(player.input.jump) && player.canJump()) {
            commands.push(jumpCommand(player));
        }
        return commands;

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


    Game.prototype.render = function() {
        /*    this.game.debug.text(this.player1.name + ' ' + this.player1.score, 64, 32);
        this.game.debug.text('Touches ' + this.player1.numTouches, 64, 64);
        this.game.debug.text(this.player2.name + ' ' + this.player2.score, this.game.width - 160, 32);
        this.game.debug.text('Touches ' + this.player2.numTouches, this.game.width - 160, 64);
    */

    }

    return Game;
});