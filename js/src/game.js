define(['states/main-menu-state', 'graphics', 'keyboard-input'], function(MainMenuState, graphics, input) {
    "use strict";

    function Game() {
        if (Game.instance) {
            throw "too many games!";
        }

        var gameStates = [ new MainMenuState() ];
        var game = this;

        Game.instance = this;

        this.currentState = function() {
            return gameStates[gameStates.length - 1];
        };

        this.pushState = function(newState) {
            if (_.isFunction(newState.start)) {
                newState.start(this.currentState());
            }
            if (this.currentState() && _.isFunction(this.currentState().suspend)) {
                this.currentState().suspend();
            }
            gameStates.push(newState);
        };

        this.popState = function() {
            var result;
            if (_.isFunction(this.currentState().end)) {
                result = this.currentState().end();
            }
            gameStates.pop();
            if (_.isFunction(this.currentState().reactivate)) {
                this.currentState().reactivate(result);
            }
        };

        this.update = function(timeScale) {
            this.currentState().update(timeScale);
        };

        this.draw = function(timeScale) {
            graphics.setOrigin();
            // graphics.cls();

            this.currentState().draw(timeScale);

            graphics.swapBuffers();
        };
    }

    return Game;
});