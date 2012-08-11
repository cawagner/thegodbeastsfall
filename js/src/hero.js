direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    oppositeOf: function(d) {
        switch(d) {
            case direction.UP: return direction.DOWN;
            case direction.LEFT: return direction.RIGHT;
            case direction.RIGHT: return direction.LEFT;
            case direction.DOWN: return direction.UP;
        }
    },
    getFromXY: function(x, y) {
        switch(true) {
            case y > 0: return direction.DOWN;
            case y < 0: return direction.UP;
            case x < 0: return direction.LEFT;
            case x > 0: return direction.RIGHT;
            default: return direction.UP;
        }
    }
};

function Character(tilemap) {
    var SPEED = 0.1;
    var destX = 0, destY = 0,
        moveX = 0, moveY = 0;
    var moveRemaining = 0;
    var self = this;

    var moveTowardNewSquare = function() {
        if (self.canMove()) {
            return;
        }

        self.x += SPEED * moveX;
        self.y += SPEED * moveY;

        moveRemaining -= SPEED;
        if (moveRemaining < 0) {
            moveRemaining = 0;
            self.x = destX;
            self.y = destY;
            moveX = 0;
            moveY = 0;
        }
    };

    this.moveBy = function(dx, dy) {
        // does not perform collision detection!
        moveX = dx;
        moveY = dy;
        moveRemaining = 1;
        destX = this.x + moveX;
        destY = this.y + moveY;
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

    this.x = 0;
    this.y = 0;
    this.direction = direction.UP;
    this.tilemap = tilemap;
}

Character.prototype.warpTo = function(x, y) {
    this.x = x;
    this.y = y;
};

Character.prototype.tryMoveBy = function(dx, dy) {
    // TODO: seems like it is doing too much...
    if (dx || dy) {
        this.direction = direction.getFromXY(dx, dy);
        if (this.tilemap.isWalkable(this.x + dx, this.y + dy)) {
            this.moveBy(dx, dy);
        }
    }
    return false;
};

function Hero(tilemap, input) {
    var self = this;

    var takeWalkInput = function() {
        if (self.canMove()) {
            self.tryMoveBy(input.dirX(), input.dirY());
        }
    };

    Character.call(this, tilemap);

    this.update = (function(baseUpdate) {
        return function(timeScale) {
            baseUpdate.call(this, timeScale);
            takeWalkInput();
        };
    })(this.update);
};

Hero.prototype = new Character();