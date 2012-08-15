function Actor(map) {
    var self = this;
    var destX = 0, destY = 0, moveX = 0, moveY = 0;
    var moveRemaining = 0;

    var resetMove = function() {
        moveRemaining = 0;
        self.x = destX;
        self.y = destY;
        moveX = 0;
        moveY = 0;
    };

    var moveTowardNewSquare = function() {
        if (self.canMove()) {
            return;
        }

        self.x += Actor.MOVE_SPEED * moveX;
        self.y += Actor.MOVE_SPEED * moveY;

        moveRemaining -= Actor.MOVE_SPEED;
        if (moveRemaining < 0) {
            resetMove();
        }
    };

    this.moveBy = function(dx, dy) {
        // does not perform collision detection or check that moving is possible!
        // todo: should check that moving is possible?
        this.direction = direction.getFromXY(dx, dy);
        moveX = dx;
        moveY = dy;
        moveRemaining = 1;
        destX = this.x + dx;
        destY = this.y + dy;

        if (this.occupiesSpace) {
            this.map.unsetMask(this.x, this.y);
            this.map.setMask(destX, destY);
        }

        this.update();
        return true;
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

    this.x = 0;
    this.y = 0;
    this.direction = direction.UP;
    this.map = map;
    this.occupiesSpace = false;
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

function Npc(map) {
    Actor.call(this, map);

    var waitForNextMove = 0;

    this.occupiesSpace = true;

    this.update = (function(baseUpdate) {
        return function(timeScale) {
            var dx = 0, dy = 0, dir;
            baseUpdate.call(this, timeScale);

            if (!this.isMoving()) {
                if (waitForNextMove < 0) {
                    dir = Math.random() >= 0.5;
                    if (dir) {
                        dy = Math.floor(Math.random()*3)-1;
                    } else {
                        dx = Math.floor(Math.random()*3)-1;
                    }
                    this.tryMoveBy(dx, dy);
                    waitForNextMove = 20 + Math.random() * 40;
                }
                --waitForNextMove;
            }
        };
    })(this.update);
};
Npc.prototype = new Actor();

function Hero(map, input) {
    var self = this;

    var moveHistory = [];
    var followers = [];
    var isInteractive = true;

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

    var takeInput = function() {
        var dx = input.dirX(),
            dy = input.dirY();
        if (self.canMove()) {
            if (self.tryMoveBy(dx, dy)) {
                updateFollowers();
                // trigger step taken (check for random encounters, maybe update heros, etc)
                moveHistory.push({x: dx, y: dy});
            } else {
                // trigger "bump"
            }
        }
    };

    Actor.call(this, map);

    this.update = (function(baseUpdate) {
        return function(timeScale) {
            baseUpdate.call(this, timeScale);
            if (isInteractive) {
                takeInput();
            }
        };
    })(this.update);

    this.addFollower = function(actor) {
        followers.push(actor);
    };

    this.lockMovement = function() {
        isInteractive = false;
    };

    this.unlockMovement = function() {
        isInteractive = true;
    };

    this.archetype = "hero";
};

Hero.prototype = new Actor();

