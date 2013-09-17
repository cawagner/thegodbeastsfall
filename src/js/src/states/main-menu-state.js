define(["radio"], function(radio) {
    "use strict";

    function MainMenuState() {
        this.draw = function() {

        };

        this.update = _.once(function() {
            radio("/game/new").broadcast();
        });
    }

    return MainMenuState;
});