(function() {
    'use strict';

    requirejs.config({
        baseUrl: "js/",

        paths: {
            phaser: 'phaser',
        },

        shim: {
            'phaser': {
                exports: 'Phaser'
            }
        }
    });

    require(['game'], function(Game) {
        var game = new Game();
        game.start();
    });


//    $('body').append('<div id="slider"></div>');
}());