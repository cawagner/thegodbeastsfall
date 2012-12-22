define(['jquery', 'pubsub', 'direction'], function($, pubsub, direction) {
    "use strict";

    function Actor(archetype) {
        var self = this;
        var moveX = 0, moveY = 0;
        var moveRemaining = 0;

        var moveHistory = [];

        var moveTowardNewSquare = function(timeScale) {
            if (self.canMove()) {
                return;
            }

            moveRemaining -= Actor.MOVE_SPEED;
            if (moveRemaining <= Actor.MOVE_SPEED) {
                self.resetMove();
            } else {
                self.x += Actor.MOVE_SPEED * moveX;
                self.y += Actor.MOVE_SPEED * moveY;
            }
        };

        this.resetMove = function() {
            moveRemaining = 0;
            self.x = this.destX;
            self.y = this.destY;
            moveX = 0;
            moveY = 0;
        };

        this.moveBy = function(dx, dy) {
            // does not perform collision detection or check that moving is possible!
            // todo: should check that moving is possible?
            this.direction = direction.getFromXY(dx, dy);
            moveX = dx;
            moveY = dy;
            moveRemaining = 1;
            this.destX = (this.x + dx) | 0;
            this.destY = (this.y + dy) | 0;

            this.update();
            return true;
        };

        this.lockMovement = function() {
            this.isMovementLocked = true;
        };

        this.unlockMovement = function() {
            this.isMovementLocked = false;
        };

        this.isMoving = function() {
            return moveRemaining > 0;
        };

        this.update = function(timeScale) {
            this.frame = (this.frame + 0.05 + this.isMoving() * 0.1) % 4;
            moveTowardNewSquare(timeScale);
            this.onUpdate(timeScale);
        };

        this.onUpdate = $.noop;

        this.canMove = function() {
            return moveRemaining === 0;
        };

        this.canMoveTo = function(x, y) {
            return this.map.isWalkable(x, y);
        }

        this.canMoveBy = function(dx, dy) {
            return this.canMoveTo(this.x + dx, this.y + dy);
        };

        this.x = 0;
        this.y = 0;
        this.destX = 0;
        this.destY = 0;
        this.direction = direction.UP;
        this.occupiesSpace = true;
        this.isPushable = true;
        this.archetype = archetype;
        this.isMovementLocked = false;
        this.frame = 0;
    }

    Actor.MOVE_SPEED = 0.1;

    Actor.prototype.warpTo = function(x, y) {
        this.x = x;
        this.y = y;
        this.destX = x;
        this.destY = y;
    };

    Actor.prototype.tryMoveBy = function(dx, dy) {
        // TODO: seems like it is doing too much...
        if (dx || dy) {
            this.direction = direction.getFromXY(dx, dy);
            if (this.canMoveBy(dx, dy)) {
                this.moveBy(dx, dy);
                return true;
            }
        }
        return false;
    };

    Actor.prototype.onShove = $.noop;
    Actor.prototype.onTalk = $.noop;

    Actor.prototype.say = function(messages) {
        var d = $.Deferred();
        pubsub.subscribeOnce("/npc/talk/done", function() {
            d.resolve();
        });
        pubsub.publish("/npc/talk", [{ text: messages, speaker: this.archetype }, this]);
        return d.promise();
    };

    return Actor;
});