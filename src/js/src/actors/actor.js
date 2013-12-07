define(['rsvp', 'radio', 'ee', 'direction'], function(RSVP, radio, EventEmitter, direction) {
    "use strict";

    var MOVE_SPEED = 0.1;

    function Actor(archetype) {
        var self = this;
        var moveX = 0, moveY = 0;
        var moveRemaining = 0;

        var ee = new EventEmitter();

        var moveTowardNewSquare = function(timeScale) {
            if (self.canMove()) {
                return;
            }

            moveRemaining -= MOVE_SPEED;
            if (moveRemaining <= MOVE_SPEED) {
                self.resetMove();
            } else {
                self.x += MOVE_SPEED * moveX;
                self.y += MOVE_SPEED * moveY;
            }
        };

        this.resetMove = function() {
            moveRemaining = 0;
            this.x = this.destX;
            this.y = this.destY;
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

        this.isMoving = function() {
            return moveRemaining > 0;
        };

        this.update = function(timeScale) {
            this.frame = (this.frame + 0.05 + this.isMoving() * 0.1) % 4;
            moveTowardNewSquare(timeScale);
            if (this.isDashing) {
                moveTowardNewSquare(timeScale);
            }
            this.onUpdate(timeScale);
        };

        this.canMove = function() {
            return moveRemaining === 0;
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
        this.isDashing = false;
        this.frame = 0;
        this.font = undefined;
    };
    Actor.prototype = Object.create(EventEmitter.prototype);

    Actor.prototype.warpTo = function(x, y, direction) {
        this.destX = x;
        this.destY = y;
        if (direction !== undefined) {
            this.direction = direction;
        }
        this.resetMove();
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

    Actor.prototype.onUpdate = function() {};
    Actor.prototype.onShove = function() {};
    Actor.prototype.onTalk = function() {};

    Actor.prototype.say = function(messages) {
        var self = this;
        return new RSVP.Promise(function(resolve, reject) {
            var channel = radio("/npc/talk/done").subscribe(function done() {
                resolve();
                channel.unsubscribe(done);
            });
            radio("/npc/talk").broadcast({ text: messages, font: self.font, speaker: self.archetype }, self);
        });
    };

    Actor.prototype.canMoveTo = function(x, y) {
        return this.map.isWalkable(x, y);
    };

    Actor.prototype.canMoveBy = function(dx, dy) {
        return this.canMoveTo(this.x + dx, this.y + dy);
    };

    Actor.prototype.lockMovement = function() {
        this.isMovementLocked = true;
    };

    Actor.prototype.unlockMovement = function() {
        this.isMovementLocked = false;
    };

    return Actor;
});