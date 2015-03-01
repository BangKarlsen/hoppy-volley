'use strict';

define(function Settings() {
    return {
            debug: false,
            gravity: 800,
            defaultRestitution: 0.9,
            jumpForce: 450,
            moveForce: 200,
            ballMass: 0.5,
            ballWorldFriction: 0.1, // Between 0-1
            ballWorldRestitution: 0.9, // how bouncy it is
            playerWorldFriction: 0,
            playerWorldRestitution: 0.8,
            playerBallFriction: 0.9,
            playerBallRestitution: 1.3,
            playerCourtFriction: 1.85,
            playerCourtRestitution: 0.0
      };
});

