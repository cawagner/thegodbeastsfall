define(['underscore', 'states/main-menu-state', 'graphics'], function(_, MainMenuState, graphics) {
    "use strict";

    var gameStates = [ new MainMenuState() ];

    return {
        states: gameStates,
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

            graphics.swapBuffers();
        }
    };
});