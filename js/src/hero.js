direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
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

function Hero(tilemap, input) {
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

    var takeWalkInput = function() {
        if (self.canMove()) {
            self.moveBy(input.dirX(), input.dirY());
        }
    };

    this.x = 0;
    this.y = 0;
    this.direction = direction.UP;

    this.isMoving = function() {
        return moveRemaining > 0;
    };

    this.update = function(timeScale) {
        moveTowardNewSquare();
        takeWalkInput();
    };

    this.warpTo = function(newX, newY) {
        this.x = newX;
        this.y = newY;
    };

    this.canMove = function() {
        return moveRemaining === 0;
    };

    this.moveBy = function(dx, dy) {
        if (dx || dy) {
            this.direction = direction.getFromXY(dx, dy);
            if (tilemap.isWalkable(this.x + dx, this.y + dy)) {
                moveX = dx;
                moveY = dy;
                moveRemaining = 1;
                destX = this.x + moveX;
                destY = this.y + moveY;
                moveTowardNewSquare();
                return true;
            }
        }
        return false;
    };
}
