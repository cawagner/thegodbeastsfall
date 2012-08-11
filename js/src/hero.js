function Character(tilemap) {
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

        self.x += Character.MOVE_SPEED * moveX;
        self.y += Character.MOVE_SPEED * moveY;

        moveRemaining -= Character.MOVE_SPEED;
        if (moveRemaining < 0) {
            resetMove();
        }
    };

    this.moveBy = function(dx, dy) {
        // does not perform collision detection or check that moving is possible!
        // todo: should check that moving is possible.
        moveX = dx;
        moveY = dy;
        moveRemaining = 1;
        destX = this.x + dx;
        destY = this.y + dy;
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
        return this.tilemap.isWalkable(x, y);
    }

    this.canMoveBy = function(dx, dy) {
        return this.canMoveTo(this.x + dx, this.y + dy);
    };

    this.x = 0;
    this.y = 0;
    this.direction = direction.UP;
    this.tilemap = tilemap;
}

Character.MOVE_SPEED = 0.1;

Character.prototype.warpTo = function(x, y) {
    this.x = x;
    this.y = y;
};

Character.prototype.tryMoveBy = function(dx, dy) {
    // TODO: seems like it is doing too much...
    if (dx || dy) {
        this.direction = direction.getFromXY(dx, dy);
        if (this.canMoveBy(dx, dy)) {
            this.moveBy(dx, dy);
        }
    }
    return false;
};

function Hero(tilemap, input) {
    var self = this;

    var takeInput = function() {
        if (self.canMove()) {
            if (self.tryMoveBy(input.dirX(), input.dirY())) {
                // trigger step taken (check for random encounters, maybe update heros, etc)
            } else {
                // trigger "bump"
            }
        }
    };

    Character.call(this, tilemap);

    this.update = (function(baseUpdate) {
        return function(timeScale) {
            baseUpdate.call(this, timeScale);
            takeInput();    
        };
    })(this.update);

    this.addFollower = function(character) {

    };
};

Hero.prototype = new Character();

