'use strict';

define(function Settings() {
    return {
            debug: false,
            jumpForce: 450,
            moveForce: 200,
            ballWorldFriction: 0.1, // Friction in the contact of these two materials.
            ballWorldRestitution: 0.9, // how bouncy it is!
            playerWorldFriction: 0.5,
            playerWorldRestitution: 0.3,
            playerBallFriction: 0.9,
            playerBallRestitution: 1.3,
            playerCourtFriction: 0.5,
            playerCourtRestitution: 0.3
        };
});

