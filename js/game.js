'use strict';

define([
    'phaser', 'ball', 'court', 'player'
], function(Phaser, Ball, Court, Player) {
    function Game() {
        console.log('Making the Game');
    }

    Game.prototype.constructor = Game;

    Game.prototype.start = function() {
        this.game = new Phaser.Game(800, 400, Phaser.CANVAS, 'volley', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });

        this.game.settings = {
            debug: false,
            jumpForce: 450,
            moveForce: 200,
            ballSprite: 'ball',
            ballSpriteFile: 'assets/ball.png'
        };
    };

    Game.prototype.preload = function() {
        // It would be better to load these in the modules where they are used (player/ball/net)
        // but that seems to break something..
        this.game.load.image('sky', 'assets/sky.png');
        this.game.load.image('ground', 'assets/platform.png');
        this.game.load.image('dude', 'assets/hoppy.png');
        this.game.load.image('ball', 'assets/ball.png');
        this.game.load.image('net', 'assets/bg.png');
        this.game.load.image('floor', 'assets/bg.png');

        // Load player shape data exported from PhysicsEditor. Also check player.js loadPolygon()
        this.game.load.physics('physicsData', 'assets/hoppy_physics.json');
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

        this.currentServer = this.player2.name;
        this.ball.serve(this.player2);

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
        playerWorldContactMaterial.friction = 0.5; 
        playerWorldContactMaterial.restitution = 0.3; 

        var playerBallContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, ballMaterial);
        playerBallContactMaterial.friction = 0.9;
        playerBallContactMaterial.restitution = 1.3; 

        var playerCourtContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, courtMaterial);
        playerCourtContactMaterial.friction = 0.5;
        playerCourtContactMaterial.restitution = 0.3;
    }

    function initScoreText(parent) {
        var style = {
            font: '20px Arial',
            fill: '#ffffff'
        };

        style.align = 'left';
        parent.textNamePlayer1 = parent.game.add.text(75, 32, parent.player1.name, style);
        parent.textScorePlayer1 = parent.game.add.text(45, 32, parent.player1.score, style);
        
        style.align = 'right';
        parent.textNamePlayer2 = parent.game.add.text(parent.game.width - 110, 32, parent.player2.name, style);
        parent.textScorePlayer2 = parent.game.add.text(parent.game.width - 45, 32, parent.player2.score, style);
    }

    Game.prototype.update = function() {
        if (this.ball.touchedFloor > 3) {
            if (this.ball.lastTouchedBy === this.player1.name) {
                this.ball.serve(this.player2);
            } else {
                this.ball.serve(this.player1);
            }
        }

        updateScoreText(this);
        updateCommands(this);
    };

    function updateScoreText(parent) {
        parent.textScorePlayer1.text = '' + parent.player1.score;
        parent.textScorePlayer2.text = '' + parent.player2.score;
    }

    function updateCommands(parent) {
        var commands = [];

        // get commands from input
        commands = handleInput(commands, parent.player1, parent.game);
        commands = handleInput(commands, parent.player2, parent.game);

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
        this.game.debug.text(this.player1.name + ' ' + this.player1.score, 64, 32);
        this.game.debug.text('Touches ' + this.player1.numTouches, 64, 64);
        this.game.debug.text(this.player2.name + ' ' + this.player2.score, this.game.width - 160, 32);
        this.game.debug.text('Touches ' + this.player2.numTouches, this.game.width - 160, 64);
        this.game.debug.text('ball.touchedFloor = ' + this.ball.touchedFloor, this.game.width / 2, 14);
    };

    return Game;
});