function ScrollTransitionState(toState, options) {
    var graphics = Game.instance.graphics;
    var maxOffset = graphics.height();

    this.offset = 0;
    this.fromState = Game.instance.currentState();
    this.toState = toState;

    options = _.defaults(options || {}, {
        speed: 2
    });

    Game.instance.popState();

    //options = _.defaults();

    this.start = function(previousState) {
        this.fromState = previousState || this.fromState;
    };

    this.draw = function(delta) {
        var self = this;
        graphics.withOriginOffset(0, -this.offset, function() {
            self.fromState.draw(delta);
        });
        graphics.withOriginOffset(0, -this.offset + graphics.height(), function() {
            self.toState.draw(delta);
        });
    };

    this.update = function(delta) {
        this.offset += options.speed;
        if (this.offset >= maxOffset) {
            Game.instance.popState(); // pop this state
            Game.instance.pushState(this.toState); // push state we're transitioning to
        }
    };
}
