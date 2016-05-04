'use strict';

define(function() {
    function AI(game) {
        this.game = game;
    }

    AI.prototype.constructor = AI;

    AI.prototype.getCommands = function(player) {
        var commands = [];
        if (player.canJump()) {
            commands.push(player.jump.bind(player));
        }
        return commands;
    }

    return AI;
});
