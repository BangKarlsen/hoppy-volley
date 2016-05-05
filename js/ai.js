'use strict';

define(function() {
    function AI(game) {
        this.game = game;
    }

    AI.prototype.constructor = AI;

    AI.prototype.getCommands = function(player) {
        var commands = [];

        commands.push(player.jump.bind(player));

        return commands;
    }

    return AI;
});
