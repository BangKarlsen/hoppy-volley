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

    var game;
    require(['game'], function(Game) {
        game = new Game();
        game.start();
    });

    //makeUiSlider('jumpForce', 426, 0, 900, 2);
    //makeUiSlider('moveForce', 200, 0, 600, 2);
    //makeUiSlider('ballWorldFriction', 0.1, 0, 1, 0.05);
    //makeUiSlider('ballWorldRestitution', 0.9, 0, 1, 0.05);
    //makeUiSlider('playerWorldFriction', 0.5, 0, 1, 0.05);
    //makeUiSlider('playerWorldRestitution', 0.3, 0, 1, 0.05);
    //makeUiSlider('playerBallFriction', 0.9, 0, 1, 0.05);
    //makeUiSlider('playerBallRestitution', 1.3, 0, 1, 0.05);
    //makeUiSlider('playerCourtFriction', 0.5, 0, 1, 0.05);
    //makeUiSlider('playerCourtRestitution', 0.3, 0, 1, 0.05);


    function makeUiSlider(parameterName, startValue, minValue, maxValue, step) {
        var html = 
           '<div class="labeledslider">'
         + '    <div class="slider-label">' + parameterName 
         + '        <span id="label-' + parameterName + '">' + startValue + '</span></div>'
         + '        <div class="slider-wrapper"><div id="slider-' + parameterName + '"></div>'
         + '    </div>'
         + '</div>';
        $('body').append(html);

        $('#slider-' + parameterName).slider({
            value: startValue,  
            min: minValue, 
            max: maxValue, 
            step: step,     
            slide: function(event, ui) {                           // whenever the slider is adjusted...
                game.game.settings[parameterName] = ui.value;      // update the selected letter variable,
                $('#label-' + parameterName).text(ui.value);       // and update the slider label text.
            }
        });
    }
}());