define([], function() {
    "use strict";

    function Game(graphics, input) {
        if (Game.instance) {
            throw "too many games!";
        }

        var gameStates = [ new MainMenuState() ];
        var game = this;

        this.input = input;
        this.graphics = graphics;

        Game.instance = this;

        this.currentState = function() {
            return gameStates[gameStates.length - 1];
        };

        this.pushState = function(newState) {
            if (_.isFunction(newState.start)) {
                newState.start(this.currentState());
            }
            if (_.isFunction(this.currentState().suspend)) {
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