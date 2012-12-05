define(['pubsub', 'actors/actor', 'keyboard-input', 'direction', 'game-state'], function(pubsub, Actor, input, direction, gameState) {
    "use strict";

    var PUSH_AFTER = 15;

    function Hero() {
        var self = this;

        var moveHistory = [];
        var failedMoves = 0;
        var isStepping = false;

        var takeInput = function() {
            var dx = input.dirX(), dy = input.dirY();

            if (isStepping && self.canMove()) {
                isStepping = false;
                pubsub.publish("/hero/step");
            }

            if (self.canMove() && (dx || dy)) {
                if (self.tryMoveBy(dx, dy)) {
                    isStepping = true;
                    failedMoves = 0;
                    // TODO: this is stupid and ugly!
                    gameState.totalSteps++;
                    gameState.location.x = Math.floor(self.x);
                    gameState.location.y = Math.floor(self.y);
                    gameState.location.direction = self.direction;
                } else {
                    ++failedMoves;
                    if (failedMoves > PUSH_AFTER) {
                        self.shove();
                    }
                }
            }

            if (input.wasConfirmPressed()) {
                self.talk();
            }

            // TODO: move this elsewhere?
            if (input.wasCancelPressed()) {
                pubsub.publish("/hero/menu");
            }
        };

        Actor.call(this, "hero");

        this.shove = function() {
            var d = direction.convertToXY(this.direction);
            var otherGuy = this.map.getActor(this.x + d.x, this.y + d.y);
            if (otherGuy && otherGuy.isPushable && otherGuy.canMove()) {
                otherGuy.onShove();
                if (otherGuy.tryMoveBy(d.x, d.y)) {
                    otherGuy.update();
                    this.update();
                }
            }
        };

        this.talk = function() {
            var d = direction.convertToXY(this.direction);
            var otherGuy = this.map.getActor(this.x + d.x, this.y + d.y);
            // TODO: pass anything in to this? Call less directly?
            if (otherGuy) {
                if (otherGuy.onTalk() !== false) {
                    otherGuy.direction = direction.oppositeOf(this.direction);
                }
            }
        };

        this.onUpdate = function(timeScale) {
            if (!this.isMovementLocked) {
                takeInput();
            }
        };
    };

    Hero.prototype = new Actor();

    return Hero;
});