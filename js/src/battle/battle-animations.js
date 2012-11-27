define([], function() {
    "use strict";

    return {
        pushDown: function() {
            var pushingDown = 4;
            var pushDown = 1;
            return {
                update: function() {
                    pushDown += pushingDown;
                    pushingDown -= 0.5;
                    return pushDown <= 0;
                },
                transform: function(dest) {
                    dest.y += pushDown;
                }
            };
        },
        pushUp: function(pawn) {
            var pushUp = 1;
            var pushingUp = 4;
            return {
                update: function() {
                    pushUp += pushingUp;
                    pushingUp -= 0.5;
                    return pushUp <= 0;
                },
                transform: function(dest) {
                    dest.y -= pushUp;
                }
            };
        },
        wiggleAttack: function(pawn) {
            var wave = 0;
            return {
                transform: function(dest) {
                    dest.x += Math.sin(wave) * 8;
                    dest.y += Math.abs(Math.sin(wave)) * 2;
                },
                update: function() {
                    wave += Math.PI / 10;
                    return wave >= 2*Math.PI;
                }
            };
        }
    };
});