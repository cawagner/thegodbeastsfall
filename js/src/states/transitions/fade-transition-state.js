define(["game", "constants", "graphics"], function(game, constants, graphics) {
    "use strict";

    function FadeTransitionState(toState, options) {
        var self = this;

        this.step = 0;
        this.fade = 1;
        this.delay = 0;
        this.fromState = game.currentState();
        this.toState = toState;

        options = _.defaults(options || {}, {
            speed: 0.33,
            delay: 5
        });

        this.start = function(previousState) {
            self.fromState = previousState || self.fromState;
        };

        this.draw = function(delta) {
            graphics.setOrigin();
            if (this.step === 0) {
                self.fromState.draw(delta);
            } else {
                self.toState.draw(delta);
            }
            graphics.setFillColorRGB(0, 0, 0);
            graphics.setAlpha(1-this.fade);
            graphics.setOrigin();
            graphics.drawFilledRect(0, 0, constants.GAME_WIDTH, constants.GAME_HEIGHT);
            graphics.setAlpha(1);
        };

        this.update = function(delta) {
            if (this.delay > 0) {
                this.delay--;
                return;
            }

            this.delay = options.delay;
            if (self.step === 0) {
                self.fade -= options.speed;
                if (self.fade < 0) {
                    self.fade = 0;
                    self.step = 1;
                }
            } else {
                self.fade += options.speed;
                if (self.fade > 1) {
                    game.popState(); // pop this state
                    game.pushState(self.toState); // push state we're transitioning to
                }
            }
        };
    }

    return FadeTransitionState;
});