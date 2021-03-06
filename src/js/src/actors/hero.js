define([
    'radio',
    'actors/actor',
    'keyboard-input',
    'direction',
    'game-state'
], function(radio,
    Actor,
    input,
    direction,
    gameState
) {
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
                radio("/hero/step").broadcast();
            }

            if (self.canMove() && (dx || dy)) {
                if (self.tryMoveBy(dx, dy)) {
                    isStepping = true;
                    failedMoves = 0;
                    self.savePosition();
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

            self.isDashing = input.isConfirmDown();

            // TODO: move this elsewhere?
            if (input.wasCancelPressed()) {
                radio("/hero/menu").broadcast();
            }
        };

        Actor.call(this, gameState.party[0].archetype);

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

    Hero.prototype.savePosition = function() {
        // TODO: this is stupid and ugly!
        gameState.totalSteps++;
        gameState.location.x = Math.floor(this.x);
        gameState.location.y = Math.floor(this.y);
        gameState.location.direction = this.direction;
    };

    Hero.prototype.warpTo = function(x, y, direction) {
        Actor.prototype.warpTo.call(this, x, y, direction);
        this.savePosition();
    };

    return Hero;
});