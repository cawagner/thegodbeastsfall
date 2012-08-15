function Npc(map) {
    Actor.call(this, map);

    this.wander = wanderlust(this);

    this.update = (function(baseUpdate) {
        return function(timeScale) {
            baseUpdate.call(this, timeScale);
            this.wander();
        };
    })(this.update);
};
Npc.prototype = new Actor();

function Hero(map, input) {
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

    Actor.call(this, map);

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

    this.update = (function(baseUpdate) {
        return function(timeScale) {
            baseUpdate.call(this, timeScale);
            if (!this.isMovementLocked()) {
                takeInput();
            }
        };
    })(this.update);

    this.archetype = "hero";
};

Hero.prototype = new Actor();

