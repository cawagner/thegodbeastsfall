function Actor(map) {
    var self = this;
    var moveX = 0, moveY = 0;
    var moveRemaining = 0;
    var isMovementLocked = false;

    var moveHistory = [];
    var followers = [];

    var moveTowardNewSquare = function() {
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

    this.update = function() {
        moveTowardNewSquare();
    };

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
            actor.wander = wanderlust(actor);
            actor.isPushable = true;
        });
        followers = [];
        moveHistory = [];
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

    this.x = 0;
    this.y = 0;
    this.destX = 0;
    this.destY = 0;
    this.direction = direction.UP;
    this.map = map;
    this.occupiesSpace = true;
    this.isPushable = true;
}

Actor.MOVE_SPEED = 0.1;

Actor.prototype.warpTo = function(x, y) {
    this.x = x;
    this.y = y;
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

function wanderlust(self) {
    var waitForNextMove = 0;
    return function() {
        var dx = 0, dy = 0, dir;
        if (!(self.isMoving() || self.isMovementLocked())) {
            if (waitForNextMove < 0) {
                dir = Math.random() >= 0.5;
                if (dir) {
                    dy = Math.floor(Math.random()*3)-1;
                } else {
                    dx = Math.floor(Math.random()*3)-1;
                }
                self.tryMoveBy(dx, dy);
                waitForNextMove = 20 + Math.random() * 40;
            }
            --waitForNextMove;
        }
    };
}
