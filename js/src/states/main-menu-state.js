define(["game-state"], function(gameState) {
    "use strict";

    function MainMenuState() {
        this.draw = function() {

        };

        this.update = _.once(function() {
            gameState.newGame();
        });
    }

    return MainMenuState;
});