define(['underscore', 'states/main-menu-state', 'graphics', "touch-input"], function(_, MainMenuState, graphics, touchInput) {
    "use strict";

    var gameStates = [ new MainMenuState() ];

    return {
        states: gameStates,
        resetStates: function() {
            while (gameStates.length > 1) {
                gameStates.pop();
            }
        },
        currentState: function() {
            return gameStates[gameStates.length - 1];
        },
        pushState: function(newState) {
            if (_.isFunction(newState.start)) {
                newState.start(this.currentState());
            }
            if (this.currentState() && _.isFunction(this.currentState().suspend)) {
                this.currentState().suspend();
            }
            gameStates.push(newState);
        },
        popState: function() {
            var result;
            if (_.isFunction(this.currentState().end)) {
                result = this.currentState().end();
            }
            gameStates.pop();
            if (_.isFunction(this.currentState().reactivate)) {
                this.currentState().reactivate(result);
            }
        },
        update: function(timeScale) {
            this.currentState().update(timeScale);
        },
        draw: function(timeScale) {
            graphics.setOrigin();
            // graphics.cls();

            this.currentState().draw(timeScale);

            touchInput.draw();

            graphics.swapBuffers();
        }
    };
});