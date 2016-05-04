'use strict';

define([
    'phaser', 'ball', 'court', 'player', 'settings', 'ai'
], function (Phaser, Ball, Court, Player, Settings, AI) {
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

        // Init rest of the game
        this.ball = new Ball(this.game);
        this.court = new Court(this.game);
        this.ai = new AI(this.game);
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
                type: 'ai',
                left: Phaser.Keyboard.LEFT,
                right: Phaser.Keyboard.RIGHT,
                jump: Phaser.Keyboard.UP
            }
        }, this.ball, this.game);

        var servingPlayer = findServingPlayer(this);
        this.ball.serve(servingPlayer);

        initMaterials.apply(this);
        initScoreText.apply(this);
    };

    function findServingPlayer(Game) {
        return Math.floor(Math.random() * 2 + 1) === 1 ? Game.player1 : Game.player2;
    }

    function initMaterials() {
        var playerMaterial = this.game.physics.p2.createMaterial('playerMaterial');
        var ballMaterial = this.game.physics.p2.createMaterial('ballMaterial', this.ball.sprite.body);
        var worldMaterial = this.game.physics.p2.createMaterial('worldMaterial');
        var courtMaterial = this.game.physics.p2.createMaterial('courtMaterial', this.court.floorSprite.body);

        this.player1.sprite.body.setMaterial(playerMaterial);
        this.player2.sprite.body.setMaterial(playerMaterial);

        //  4 trues = the 4 faces of the world in left, right, top, bottom order
        this.game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);

        var ballWorldContactMaterial = this.game.physics.p2.createContactMaterial(ballMaterial, worldMaterial);
        ballWorldContactMaterial.friction = this.game.settings.ballWorldFriction; // Friction to use in the contact of these two materials.
        ballWorldContactMaterial.restitution = this.game.settings.ballWorldRestitution; // Restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

        var playerWorldContactMaterial = this.game.physics.p2.createContactMaterial(playerMaterial, worldMaterial);
        playerWorldContactMaterial.friction = this.game.settings.playerWorldFriction;
        playerWorldContactMaterial.restitution = this.game.settings.playerWorldRestitution;

        var playerBallContactMaterial = this.game.physics.p2.createContactMaterial(playerMaterial, ballMaterial);
        playerBallContactMaterial.friction = this.game.settings.playerBallFriction;
        playerBallContactMaterial.restitution = this.game.settings.playerBallRestitution;

        var playerCourtContactMaterial = this.game.physics.p2.createContactMaterial(playerMaterial, courtMaterial);
        playerCourtContactMaterial.friction = this.game.settings.playerCourtFriction;
        playerCourtContactMaterial.restitution = this.game.settings.playerCourtRestitution;
    }

    function initScoreText() {
        var style = {
            font: '20px Arial',
            fill: '#ffffff'
        };

        style.align = this.player1.side;
        this.textNamePlayer1 = this.game.add.text(75, 32, this.player1.name, style);
        this.textScorePlayer1 = this.game.add.text(45, 32, '' + this.player1.score, style);

        style.align = this.player2.side;
        this.textNamePlayer2 = this.game.add.text(this.game.width - 110, 32, this.player2.name, style);
        this.textScorePlayer2 = this.game.add.text(this.game.width - 45, 32, '' + this.player2.score, style);
    }

    Game.prototype.update = function () {
        if (this.ball.touchedRightFloor > 2) {
            placePlayers.apply(this);
            if (this.ball.lastServer === this.player1.id) {
                updateScore(this.player1, this.textScorePlayer1);
                this.ball.serve(this.player1);
            } else {
                this.ball.serve(this.player1);                            
            }
        }

        if (this.ball.touchedLeftFloor > 2) {
            placePlayers.apply(this);
            if (this.ball.lastServer === this.player2.id) {
                updateScore(this.player2, this.textScorePlayer2);
                this.ball.serve(this.player2);                            
            } else {
                this.ball.serve(this.player2);                            
            }
        }
        
        // check for max number of touches here

        handleCommands(this);
    };

    function placePlayers() {
        this.player1.moveToStart();                        
        this.player2.moveToStart();                        
    }

    function updateScore(player, textScore) {
        player.score++;
        textScore.text = '' + player.score;
        console.log(player.name + ': ' + player.score);
    }

    function handleCommands(Game) {
        var commands = [],
            player2commands;

        commands = getCommands(Game.player1, Game.game, Game.ai);
        player2commands = getCommands(Game.player2, Game.game, Game.ai);
        
        Array.prototype.push.apply(commands, player2commands);

        // execute commands
        commands.forEach(function (command) {
            command();
        });
    }

    function getCommands(player, game, ai) {
        var commands = [];

        function handleInput() {
            if (game.input.keyboard.isDown(player.input.left)) {
                commands.push(player.moveLeft.bind(player));
            }
            if (game.input.keyboard.isDown(player.input.right)) {
                commands.push(player.moveRight.bind(player));
            }
            if (game.input.keyboard.isDown(player.input.jump) && player.canJump()) {
                commands.push(player.jump.bind(player));
            }            
        }

        switch (player.input.type) {
            case 'keyboard':
                handleInput();
                break;
            case 'ai':
                Array.prototype.push.apply(commands, ai.getCommands(player));
                break;
            default:
                console.log('Error: Unknown input type.');
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
