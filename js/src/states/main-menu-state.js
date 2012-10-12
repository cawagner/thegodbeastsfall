define(["game-state"], function(GameState) {
    "use strict";

    function MainMenuState() {
        this.draw = function() {

        };

        this.update = _.once(function() {
            GameState.instance.newGame();
        });
    }

    return MainMenuState;
});