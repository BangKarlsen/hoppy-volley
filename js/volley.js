(function() {

    var game = new Phaser.Game(800, 400, Phaser.AUTO, 'volley', {
        preload: preload,
        create: create,
        update: update
    });

    function preload() {

        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('dude', 'assets/phaser-dude.png');

    }

    var player;
    var platforms;
    var cursors;


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
        player.body.drag.x = 250;

        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();

    }

    function update() {

        //  Collide the player and the stars with the platforms
        game.physics.arcade.collide(player, platforms);

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

}());