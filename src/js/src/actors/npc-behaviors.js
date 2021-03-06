define(['underscore'], function(_) {
    "use strict";
    return {
        wanderlust: function(self) {
            self.isPushable = true;
            var waitForNextMove = 0;
            return function() {
                var dx = 0, dy = 0, dir;
                if (!(self.isMoving() || self.isMovementLocked)) {
                    if (waitForNextMove < 0) {
                        dir = Math.random() >= 0.5;
                        if (dir) {
                            dy = Math.floor(Math.random()*3)-1;
                        } else {
                            dx = Math.floor(Math.random()*3)-1;
                        }
                        self.tryMoveBy(dx, dy);
                        waitForNextMove = 50 + Math.random() * 100;
                    }
                    --waitForNextMove;
                }
            };
        },
        stationary: function(self) {
            self.isPushable = false;
            return _.noop;
        },
        boulder: function(self) {
            self.isPushable = true;
            return _.noop;
        }
    };
});