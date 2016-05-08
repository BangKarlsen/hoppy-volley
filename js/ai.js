'use strict';

define(function() {
    function AI(game) {
        this.game = game;
    }

    AI.prototype.constructor = AI;

    AI.prototype.getCommands = function(player, ball) {
        var commands = [];

        commands.push(player.jump.bind(player));
        // if (!ball.isActive()) {}

        return commands;
    }

    return AI;
});
