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

        if (input.wasCancelPressed()) {
            new Menu([
                "Status",
                "Items",
                "System"
            ]).select(function(){
                this.close();
            }).show();
        }
    };

    Actor.call(this, "hero");

    this.shove = function() {
        var d = direction.convertToXY(this.direction);
        var otherGuy = this.map.getActor(this.x + d.x, this.y + d.y);
        if (otherGuy && otherGuy.isPushable && otherGuy.canMove()) {
            if (otherGuy.onShove) {
                otherGuy.onShove();
            }
            otherGuy.tryMoveBy(d.x, d.y);
        }
    };

    this.talk = function() {
        var d = direction.convertToXY(this.direction);
        var otherGuy = this.map.getActor(this.x + d.x, this.y + d.y);
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
