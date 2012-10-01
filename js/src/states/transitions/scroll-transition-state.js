function ScrollTransitionState(toState, options) {
    var maxOffset = Game.instance.graphics.height();

    this.yOffset = 0;
    this.toState = toState;

    options = _.defaults();

    this.start = function(previousState) {
        this.fromState = previousState;
    };

    this.draw = function(delta) {

    };

    this.update = function(delta) {
        this.yOffset += 1;
        if (this.yOffset >= maxOffset) {
            Game.instance.popState(); // pop this state
            Game.instance.popState(); // pop state we're transitioning from
            Game.instance.pushState(this.toState); // push state we're transitioning to
        }
    };
}
