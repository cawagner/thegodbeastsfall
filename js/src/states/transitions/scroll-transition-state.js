define([], function() {
    function ScrollTransitionState(toState, options) {
        var graphics = Game.instance.graphics;
        var maxOffset = graphics.height();

        // TODO: constructor has side effects! bad, bad!

        this.offset = 0;
        this.fromState = Game.instance.currentState();
        this.toState = toState;

        options = _.defaults(options || {}, {
            speed: 2
        });

        //options = _.defaults();

        this.start = function(previousState) {
            this.fromState = previousState || this.fromState;
        };

        this.draw = function(delta) {
            var self = this;
            graphics.withOriginOffset(0, -this.offset, function() {
                graphics.setOrigin();
                self.fromState.draw(delta);
            });
            graphics.withOriginOffset(0, -this.offset + graphics.height(), function() {
                graphics.setOrigin();
                self.toState.draw(delta);
            });
            graphics.setOrigin();
        };

        this.update = function(delta) {
            this.offset += options.speed;
            if (this.offset >= maxOffset) {
                Game.instance.popState(); // pop this state
                Game.instance.pushState(this.toState); // push state we're transitioning to
            }
        };
    }

    return ScrollTransitionState;
});