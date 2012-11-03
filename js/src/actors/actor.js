define(['jquery', 'direction'], function($, direction) {
    "use strict";
    
    function Actor(archetype) {
        var self = this;
        var moveX = 0, moveY = 0;
        var moveRemaining = 0;
        var isMovementLocked = false;

        var moveHistory = [];
        var followers = [];

        var moveTowardNewSquare = function(timeScale) {
            if (self.canMove()) {
                return;
            }

            self.x += Actor.MOVE_SPEED * moveX;
            self.y += Actor.MOVE_SPEED * moveY;

            moveRemaining -= Actor.MOVE_SPEED;
            if (moveRemaining < 0) {
                self.resetMove();
            }
        };

        var updateFollowers = function() {
            var lastMove;
            var i;
            if (moveHistory.length > followers.length) {
                moveHistory.shift(1);
            }
            for (i = 0; i < followers.length; ++i) {
                lastMove = moveHistory[moveHistory.length - i - 1];
                if (lastMove !== undefined) {
                    followers[i].moveBy(lastMove.x, lastMove.y, false);
                }
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
            this.destX = this.x + dx;
            this.destY = this.y + dy;

            updateFollowers();
            if (followers.length) {
                moveHistory.push({x: dx, y: dy});
            }

            this.update();
            return true;
        };

        this.isMovementLocked = function() {
            return isMovementLocked;
        };

        this.lockMovement = function() {
            isMovementLocked = true;
        };

        this.unlockMovement = function() {
            isMovementLocked = false;
        };

        this.isMoving = function() {
            return moveRemaining > 0;
        };

        this.update = function(timeScale) {
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

        this.addFollower = function(actor) {
            var followerDirection = direction.oppositeOf(this.direction);
            var d = direction.convertToXY(followerDirection);

            actor.resetMove();
            actor.warpTo(this.x, this.y);
            actor.direction = this.direction;
            actor.isPushable = false;
            this.isPushable = false;

            followers.push(actor);
        };

        this.clearFollowers = function() {
            _(followers).each(function(actor) {
                // TODO: don't assume this is the correct behavior!
                actor.wander = Npc.behaviors.wanderlust(actor);
                actor.isPushable = true;
            });
            followers = [];
            moveHistory = [];
        };

        this.x = 0;
        this.y = 0;
        this.destX = 0;
        this.destY = 0;
        this.direction = direction.UP;
        this.occupiesSpace = true;
        this.isPushable = true;
        this.archetype = archetype;
    }

    Actor.MOVE_SPEED = 0.05;

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
        $.publish("/npc/talk", [messages, this]);
    };

    return Actor;
});