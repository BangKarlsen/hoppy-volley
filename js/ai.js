'use strict';

define(function() {
    function AI(game) {
        this.game = game;
    }

    AI.prototype.constructor = AI;

    function aiServe(player, ball) {
        var commands = [];
        if (player.side === 'left') {
            if (player.x() > ball.x() - 30) {
                commands.push(player.jump.bind(player));
            } else {
                commands.push(player.moveRight.bind(player));
            }
        } else {
            if (player.x() < ball.x() + 30) {
                commands.push(player.jump.bind(player));
            } else {
                commands.push(player.moveLeft.bind(player));
            }
        }
        return commands;
    }

    AI.prototype.getCommands = function(player, ball) {
        var commands = [];

        if (!ball.isActive) {
            if (ball.lastServer === player.id) {
                return aiServe(player, ball);
            }
        }

        return commands;
    }

    return AI;
});
