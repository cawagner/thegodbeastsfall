function Npc(archetype) {
    Actor.call(this, archetype);

    this.wander = wanderlust(this);

    this.onUpdate = function(timeScale) {
        this.wander();
    };
};
Npc.prototype = new Actor();

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

function Hero(input) {
    var self = this;

    var moveHistory = [];
    var followers = [];
    var failedMoves = 0, pushAfter = 15;

    var takeInput = function() {
        var dx = input.dirX(), dy = input.dirY();

        if (self.canMove()) {
            if (self.tryMoveBy(dx, dy)) {
                failedMoves = 0;
            } else {
                if (dx || dy) {
                    ++failedMoves;
                    if (failedMoves > pushAfter) {
                        self.shove();
                    }
                }
            }
        }

        if (input.wasConfirmPressed()) {
            self.talk();
        }
    };

    Actor.call(this, "hero");

    this.shove = function() {
        var d = direction.convertToXY(this.direction);
        var otherGuy = map.getActor(this.x + d.x, this.y + d.y);
        if (otherGuy && otherGuy.isPushable && otherGuy.canMove()) {
            if (otherGuy.onShove) {
                otherGuy.onShove();
            }
            otherGuy.moveBy(d.x, d.y);
        }
    };

    this.talk = function() {
        var d = direction.convertToXY(this.direction);
        var otherGuy = map.getActor(this.x + d.x, this.y + d.y);
        // TODO: pass anything in to this? Call less directly?
        if (otherGuy && otherGuy.onTalk) {
            otherGuy.onTalk();
        }
    };

    this.onUpdate = function(timeScale) {
        if (!this.isMovementLocked()) {
            takeInput();
        }
    };
};

Hero.prototype = new Actor();
