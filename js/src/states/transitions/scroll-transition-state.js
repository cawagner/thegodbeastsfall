define(["game", "constants", "graphics"], function(game, constants, graphics) {
    "use strict";

    function ScrollTransitionState(toState, options) {
        var maxOffset = graphics.height;

        // TODO: constructor has side effects! bad, bad!

        this.offset = 0;
        this.fromState = game.currentState();
        this.toState = toState;

        options = _.defaults(options || {}, {
            speed: 4
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
            graphics.withOriginOffset(0, -this.offset + constants.GAME_HEIGHT, function() {
                graphics.setOrigin();
                self.toState.draw(delta);
            });
            graphics.setOrigin();
        };

        this.update = function(delta) {
            this.offset += options.speed;
            if (this.offset >= maxOffset) {
                game.popState(); // pop this state
                game.pushState(this.toState); // push state we're transitioning to
            }
        };
    }

    return ScrollTransitionState;
});