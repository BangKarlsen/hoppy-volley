'use strict';

define(function() {
    function AI(game) {
        this.game = game;
    }

    AI.prototype.constructor = AI;

    function distance(pos1, pos2) {
        return Math.sqrt((pos2.x - pos1.x) * (pos2.x - pos1.x) + (pos2.y - pos1.y) * (pos2.y - pos1.y));
    }

    function doServe(player, ball) {
        var commands = [];
        if (player.side === 'left') {
            console.log('dist ' + distance(player.pos(), ball.pos()));
            if (distance(player.pos(), ball.pos()) < 95) {
                console.log('jmp!');
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
                return doServe(player, ball);
            }
        }

        return commands;
    }

    return AI;
});
