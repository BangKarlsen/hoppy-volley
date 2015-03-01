'use strict';

define([
    'phaser', 'ball', 'court', 'player', 'settings'
], function (Phaser, Ball, Court, Player, Settings) {
    function Game() {
        console.log('Making the Game');
    }

    Game.prototype.constructor = Game;

    Game.prototype.start = function () {
        this.game = new Phaser.Game(800, 400, Phaser.CANVAS, 'volley', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });

        this.game.settings = Settings; 
    };

    Game.prototype.preload = function () {
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

    Game.prototype.create = function () {
        this.game.add.sprite(0, 0, 'sky');

        // Init physics
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.defaultRestitution = this.game.settings.defaultRestitution;
        this.game.physics.p2.gravity.y = this.game.settings.gravity;

        // Init our actors
        this.ball = new Ball(this.game);
        this.court = new Court(this.game);
        this.player1 = new Player({
            id: 1,
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
            id: 2,
            name: 'Tobby',
            side: 'right',
            input: {
                type: 'keyboard',
                left: Phaser.Keyboard.LEFT,
                right: Phaser.Keyboard.RIGHT,
                jump: Phaser.Keyboard.UP
            }
        }, this.ball, this.game);

        var servingPlayer = findServingPlayer(this);
        this.ball.serve(servingPlayer);

        initMaterials(this.player1, this.player2, this.ball, this.court, this.game);
        initScoreText(this);
    };

    function findServingPlayer(game) {
        return Math.floor(Math.random() * 2 + 1) === 1 ? game.player1 : game.player2;
    }

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
        ballWorldContactMaterial.friction = game.settings.ballWorldFriction; // Friction to use in the contact of these two materials.
        ballWorldContactMaterial.restitution = game.settings.ballWorldRestitution; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerWorldContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, worldMaterial);
        playerWorldContactMaterial.friction = game.settings.playerWorldFriction;
        playerWorldContactMaterial.restitution = game.settings.playerWorldRestitution;

        var playerBallContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, ballMaterial);
        playerBallContactMaterial.friction = game.settings.playerBallFriction;
        playerBallContactMaterial.restitution = game.settings.playerBallRestitution;

        var playerCourtContactMaterial = game.physics.p2.createContactMaterial(playerMaterial, courtMaterial);
        playerCourtContactMaterial.friction = game.settings.playerCourtFriction;
        playerCourtContactMaterial.restitution = game.settings.playerCourtRestitution;
    }

    function initScoreText(parent) {
        var style = {
            font: '20px Arial',
            fill: '#ffffff'
        };

        style.align = parent.player1.side;
        parent.textNamePlayer1 = parent.game.add.text(75, 32, parent.player1.name, style);
        parent.textScorePlayer1 = parent.game.add.text(45, 32, '' + parent.player1.score, style);

        style.align = parent.player2.side;
        parent.textNamePlayer2 = parent.game.add.text(parent.game.width - 110, 32, parent.player2.name, style);
        parent.textScorePlayer2 = parent.game.add.text(parent.game.width - 45, 32, '' + parent.player2.score, style);
    }

    Game.prototype.update = function () {
        if (this.ball.touchedRightFloor > 2) {
            if (this.ball.lastServer === this.player1.id) {
                updateScore(this.player1, this.textScorePlayer1);
                this.ball.serve(this.player1);                            
            } else {
                this.ball.serve(this.player1);                            
            }
        }

        if (this.ball.touchedLeftFloor > 2) {
            if (this.ball.lastServer === this.player2.id) {
                updateScore(this.player2, this.textScorePlayer2);
                this.ball.serve(this.player2);                            
            } else {
                this.ball.serve(this.player2);                            
            }
        }
        
        // check for max number of touches here

        updateCommands(this);
    };

    function updateScore(player, textScore) {
        player.score++;
        textScore.text = '' + player.score;
        console.log(player.name + ': ' + player.score);
    }

    function updateCommands(parent) {
        var commands = [];

        // get commands from input
        commands = handleInput(commands, parent.player1, parent.game);
        commands = handleInput(commands, parent.player2, parent.game);

        // execute commands
        commands.forEach(function (command) {
            command();
        });
    }

    function handleInput(commands, player, game) {
        if (game.input.keyboard.isDown(player.input.left)) {
            commands.push(function moveLeftCommand() {
                player.moveLeft();
            });
        }
        if (game.input.keyboard.isDown(player.input.right)) {
            commands.push(function moveRightCommand() {
                player.moveRight();
            });
        }
        if (game.input.keyboard.isDown(player.input.jump) && player.canJump()) {
            commands.push(function jumpCommand() {
                player.jump();
            });
        }
        return commands;
    }

    Game.prototype.render = function () {
        /*     this.game.debug.text(this.player1.name + ' ' + this.player1.score, 64, 32);
        this.game.debug.text('Touches ' + this.player1.numTouches, 64, 64);
        this.game.debug.text(this.player2.name + ' ' + this.player2.score, this.game.width - 160, 32);
        this.game.debug.text('Touches ' + this.player2.numTouches, this.game.width - 160, 64);
        this.game.debug.text('ball.touchedFloor = ' + this.ball.touchedFloor, this.game.width / 2, 14);
    */
    };

    return Game;
});
