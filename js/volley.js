(function() {

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

    var player;
    var platforms;
    var cursors;
    var ball;
    var isBallGravityOn = false;


    function create() {

        //  We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  A simple background for our game
        game.add.sprite(0, 0, 'sky');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = game.add.group();

        //  We will enable physics for any object that is created in this group
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 64, 'ground');

        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        ground.scale.setTo(2, 2);

        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;


        // The player and its settings
        player = game.add.sprite(32, game.world.height - 150, 'dude');

        //  We need to enable physics on the player
        game.physics.arcade.enable(player);

        //  Player physics properties. Give the little guy a slight bounce.
        player.body.bounce.y = 0.3;
        player.body.gravity.y = 450;
        player.body.collideWorldBounds = true;
        player.body.drag.x = 450;

        // Create the ball
        ball = game.add.sprite(game.world.width / 3, game.world.height / 2, 'ball');
        game.physics.enable(ball);
        ball.body.bounce.setTo(0.7, 0.7);
        // Set ball initial gravity to 0. Activate gravity when player hits ball the first time.
        ball.body.gravity.y = 0;
        ball.body.collideWorldBounds = true;
        ball.body.drag.setTo(50, 50);

        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();
    }

    function update() {
        if (!isBallGravityOn) {
            game.physics.arcade.overlap(player, ball, activateBallGravity, null, this);
        }
        //  Collide the player and the ball with the platforms
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(ball, platforms);
        game.physics.arcade.collide(player, ball);

        //  Reset the players acceleration
        player.body.acceleration.x = 0;

        if (cursors.left.isDown) {
            //  Move to the left
            player.body.velocity.x = -150;
        } else if (cursors.right.isDown) {
            //  Move to the right
            player.body.velocity.x = 150;
        }
        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player.body.touching.down) {
            player.body.velocity.y = -300;
        }
    }

    function activateBallGravity() {
        ball.body.gravity.y = 250;
        isBallGravityOn = true;
    }

    function render() {

    }

}());