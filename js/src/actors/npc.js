function Npc(properties) {
    _.defaults(properties, {
        "archetype": "oldman",
        "behavior": "wanderlust"
    });

    Actor.call(this, properties.archetype);

    this.wander = Npc.behaviors[properties.behavior](this);

    this.onUpdate = function(timeScale) {
        this.wander();
    };
};
Npc.prototype = new Actor();

Npc.behaviors = {
    wanderlust: function(self) {
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
    },
    stationary: function(self) {
        return function() { };
    }
}
